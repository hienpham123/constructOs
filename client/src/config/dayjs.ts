import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/vi';

// Enable plugins
dayjs.extend(customParseFormat);
dayjs.extend(localizedFormat);

// Set Vietnamese locale
dayjs.locale('vi');

export default dayjs;

