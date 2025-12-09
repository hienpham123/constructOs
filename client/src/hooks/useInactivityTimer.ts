import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

/**
 * Hook để theo dõi hoạt động người dùng và tự động logout sau một khoảng thời gian không hoạt động
 * @param timeoutMinutes - Số phút không hoạt động trước khi tự động logout (mặc định: 30 phút)
 */
export function useInactivityTimer(timeoutMinutes: number = 30) {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutMs = timeoutMinutes * 60 * 1000; // Chuyển đổi phút sang milliseconds

  // Sử dụng useCallback để tránh tạo lại function mỗi lần render
  const resetTimer = useCallback(() => {
    // Xóa timer cũ nếu có
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Chỉ đặt timer mới nếu người dùng đã đăng nhập
    if (isAuthenticated) {
      timeoutRef.current = setTimeout(() => {
        // Tự động logout khi hết thời gian
        logout();
        navigate('/login', { replace: true });
      }, timeoutMs);
    }
  }, [isAuthenticated, timeoutMs, logout, navigate]);

  useEffect(() => {
    // Chỉ kích hoạt khi người dùng đã đăng nhập
    if (!isAuthenticated) {
      // Xóa timer nếu người dùng chưa đăng nhập
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // Đặt timer ban đầu
    resetTimer();

    // Các sự kiện để theo dõi hoạt động người dùng
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Thêm event listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, true);
    });

    // Cleanup: xóa timer và event listeners khi component unmount hoặc khi logout
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [isAuthenticated, resetTimer]);
}

