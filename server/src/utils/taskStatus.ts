import { query } from '../config/db.js';

type TaskStatus = 'pending' | 'in_progress' | 'submitted' | 'completed' | 'blocked' | 'cancelled';

/**
 * Tính status tự động của task cha dựa trên status của các task con
 * Logic:
 * - Nếu tất cả task con (không blocked) = completed VÀ không có task con nào blocked → task cha = completed
 * - Nếu tất cả task con (không blocked) = cancelled → task cha = cancelled
 * - Nếu có ít nhất 1 task con = in_progress, submitted, hoặc blocked → task cha = in_progress (đang làm)
 * - Nếu tất cả task con (không blocked) = pending → task cha = pending
 * - Nếu tất cả task con đều blocked → task cha = blocked
 * Lưu ý: Blocked vẫn được tính là "đang làm", chỉ khi tất cả đều blocked thì task cha mới = blocked
 */
export async function calculateParentTaskStatus(parentTaskId: string): Promise<TaskStatus> {
  try {
    // Lấy tất cả task con
    const childTasks = await query<any[]>(
      `SELECT status FROM project_tasks WHERE parent_task_id = ?`,
      [parentTaskId]
    );

    if (childTasks.length === 0) {
      // Không có task con, không cần tính
      throw new Error('Task không có task con');
    }

    const statuses = childTasks.map((t) => t.status as TaskStatus);

    // Kiểm tra xem có task con nào bị blocked không
    const hasBlocked = statuses.some((s) => s === 'blocked');

    // Lọc ra các task con không bị blocked (bỏ qua blocked)
    const nonBlockedStatuses = statuses.filter((s) => s !== 'blocked');

    // Nếu tất cả task con đều blocked, task cha = blocked
    if (nonBlockedStatuses.length === 0) {
      return 'blocked';
    }

    // Tính status dựa trên các task con không bị blocked
    // Thứ tự ưu tiên: cancelled > completed > in_progress/submitted/blocked > pending
    // Lưu ý: Blocked vẫn được tính là "đang làm" (in_progress), chỉ khi tất cả đều blocked thì task cha mới = blocked

    // Kiểm tra cancelled: Nếu tất cả task con (không blocked) đều cancelled → task cha = cancelled
    if (nonBlockedStatuses.every((s) => s === 'cancelled')) {
      return 'cancelled';
    }

    // Kiểm tra completed: Nếu tất cả task con (không blocked) đều completed VÀ không có task con nào bị blocked → task cha = completed
    if (nonBlockedStatuses.every((s) => s === 'completed') && !hasBlocked) {
      return 'completed';
    }

    // Kiểm tra in_progress, submitted, hoặc blocked: Nếu có ít nhất 1 task con đang làm (kể cả blocked) → task cha = in_progress
    // Blocked vẫn được tính là "đang làm"
    if (nonBlockedStatuses.some((s) => s === 'in_progress' || s === 'submitted') || hasBlocked) {
      return 'in_progress';
    }

    // Mặc định: pending (tất cả task con không blocked đều pending)
    return 'pending';
  } catch (error: any) {
    console.error('Error calculating parent task status:', error);
    throw error;
  }
}

/**
 * Cập nhật status của task cha tự động
 */
export async function updateParentTaskStatus(parentTaskId: string): Promise<void> {
  try {
    // Kiểm tra task cha có tồn tại không
    const parentTask = await query<any[]>(
      'SELECT id, status FROM project_tasks WHERE id = ?',
      [parentTaskId]
    );

    if (parentTask.length === 0) {
      return; // Task cha không tồn tại
    }

    // Tính status mới
    const newStatus = await calculateParentTaskStatus(parentTaskId);
    const currentStatus = parentTask[0].status;

    // Chỉ cập nhật nếu status thay đổi
    if (newStatus !== currentStatus) {
      const { toMySQLDateTime } = await import('./dataHelpers.js');
      // Đảm bảo chỉ update task cha, không update task con
      const updateResult = await query(
        'UPDATE project_tasks SET status = ?, updated_at = ? WHERE id = ?',
        [newStatus, toMySQLDateTime(), parentTaskId]
      );

      // Kiểm tra xem task cha này có phải là task con của task khác không
      // Nếu có, cập nhật tiếp task cha của nó (recursive)
      const grandParent = await query<any[]>(
        'SELECT parent_task_id FROM project_tasks WHERE id = ?',
        [parentTaskId]
      );

      if (grandParent.length > 0 && grandParent[0].parent_task_id) {
        await updateParentTaskStatus(grandParent[0].parent_task_id);
      }
    }
  } catch (error: any) {
    // Nếu task không có task con, không cần cập nhật
    if (error.message?.includes('không có task con')) {
      return;
    }
    console.error('Error updating parent task status:', error);
    throw error;
  }
}

/**
 * Kiểm tra task có task con không
 */
export async function hasChildTasks(taskId: string): Promise<boolean> {
  try {
    const childTasks = await query<any[]>(
      'SELECT COUNT(*) as count FROM project_tasks WHERE parent_task_id = ?',
      [taskId]
    );
    return (childTasks[0]?.count || 0) > 0;
  } catch (error) {
    console.error('Error checking child tasks:', error);
    return false;
  }
}
