import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faFolder,
  faBox,
  faUsers,
  faUsers as faGroup,
  faLock,
  faChartBar,
  faFileAlt,
  faComments,
  faListAlt,
  faExchangeAlt,
  faShoppingCart,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faChevronUp,
  faBars,
  faUserCircle,
  faSignOutAlt,
  faBell,
  faCog,
  faEnvelope,
  faSearch,
  faEdit,
  faTrash,
  faPlus,
  faCheck,
  faTimes,
  faDownload,
  faUpload,
  faFileDownload,
  faPaperclip,
  faEye,
  faEyeSlash,
  faUser,
  faHardHat,
  faSave,
  faCamera,
  faEllipsisV,
  faEllipsisH,
  faTable,
  faPaperPlane,
  faThumbtack,
  faFilePdf,
  faRefresh,
  faCircle,
  faUserPlus,
  faArrowLeft,
  faArrowUp,
  faArrowDown,
  faSmile,
  faChevronDown as faArrowDropDown,
} from '@fortawesome/free-solid-svg-icons';

// Mapping MUI icon names to Font Awesome icons
export const iconMap: { [key: string]: any } = {
  // Sidebar icons
  HomeIcon: faHome,
  FolderIcon: faFolder,
  Inventory2Icon: faBox,
  PersonIcon: faUser,
  LockIcon: faLock,
  BarChartIcon: faChartBar,
  ArticleIcon: faFileAlt,
  MessageIcon: faComments,
  ListAltIcon: faListAlt,
  SwapHorizIcon: faExchangeAlt,
  ShoppingCartIcon: faShoppingCart,
  
  // Layout icons
  MenuIcon: faBars,
  AccountCircleIcon: faUserCircle,
  LogoutIcon: faSignOutAlt,
  NotificationsIcon: faBell,
  SettingsIcon: faCog,
  EmailIcon: faEnvelope,
  KeyboardArrowDownIcon: faChevronDown,
  
  // Common icons
  ChevronLeftIcon: faChevronLeft,
  ChevronRightIcon: faChevronRight,
  ExpandLess: faChevronUp,
  ExpandMore: faChevronDown,
  AddIcon: faPlus,
  EditIcon: faEdit,
  DeleteIcon: faTrash,
  SearchIcon: faSearch,
  CloseIcon: faTimes,
  CheckIcon: faCheck,
  DownloadIcon: faDownload,
  UploadIcon: faUpload,
  FileDownloadIcon: faFileDownload,
  VisibilityIcon: faEye,
  VisibilityOffIcon: faEyeSlash,
  
  // Other common icons
  DashboardIcon: faHome,
  ConstructionIcon: faHardHat,
  InventoryIcon: faBox,
  PeopleIcon: faUsers,
  SecurityIcon: faLock,
  AssessmentIcon: faChartBar,
  DescriptionIcon: faFileAlt,
  ChatIcon: faComments,
  
  // Additional icons
  SaveIcon: faSave,
  PhotoCameraIcon: faCamera,
  MoreVertIcon: faEllipsisV,
  MoreHorizIcon: faEllipsisH,
  TableChartIcon: faTable,
  SendIcon: faPaperPlane,
  PushPinIcon: faThumbtack,
  PictureAsPdfIcon: faFilePdf,
  GroupIcon: faGroup,
  AttachFileIcon: faPaperclip,
  RefreshIcon: faRefresh,
  RadioButtonUncheckedIcon: faCircle,
  PersonAddIcon: faUserPlus,
  ExitToAppIcon: faSignOutAlt,
  ArrowBackIcon: faArrowLeft,
  ArrowUpwardIcon: faArrowUp,
  ArrowDownwardIcon: faArrowDown,
  ArrowDropDownIcon: faArrowDropDown,
  ClearIcon: faTimes,
  EmojiEmotionsIcon: faSmile,
  InsertEmoticonIcon: faSmile,
};

// Helper function to get Font Awesome icon component
export const getFAIcon = (muiIconName: string, props?: any) => {
  const icon = iconMap[muiIconName];
  if (!icon) {
    console.warn(`Icon mapping not found for: ${muiIconName}`);
    return null;
  }
  return <FontAwesomeIcon icon={icon} {...props} />;
};

// Helper function to get Font Awesome icon definition
export const getFAIconDefinition = (muiIconName: string) => {
  return iconMap[muiIconName] || null;
};
