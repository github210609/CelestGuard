export default {
  appName: 'CelestGuard',
  nav: {
    map: 'Map',
    friends: 'Friends',
    profile: 'Profile'
  },
  notification: {
    title: 'Notifications',
    markAllAsRead: 'Mark All as Read',
    empty: 'No notifications',
    online: '{name} is online',
    offline: '{name} is offline',
    locationShared: '{name} shared location with you',
    timeAgo: {
      justNow: 'just now',
      minutesAgo: '{minutes} minutes ago',
      hoursAgo: '{hours} hours ago',
      daysAgo: '{days} days ago'
    }
  },
  profile: {
    title: 'Profile',
    settings: 'Account Settings',
    privacy: 'Privacy Settings',
    notifications: 'Notifications',
    about: 'About Us',
    logout: 'Logout',
    logoutConfirm: {
      title: 'Confirm Logout',
      message: 'You need to login again after logging out',
      confirm: 'Logout',
      cancel: 'Cancel'
    },
    stats: {
      guardian: 'Guardian',
      beingGuarded: 'Protected'
    },
    language: 'Language',
    languages: {
      zh: '简体中文',
      en: 'English',
      ko: '한국어',
      ja: '日本語'
    },
    languageChanged: 'Language updated',
    logoutSuccess: 'Logged out successfully'
  },
  common: {
    id: 'ID',
    loading: 'Loading...',
    error: 'Error occurred',
    retry: 'Retry',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete'
  },
  userStatus: {
    online: 'Online',
    offline: 'Offline',
    noLocation: 'No location info',
    moving: 'Moving'
  },
  friends: {
    search: 'Search Friends',
    add: 'Add Friend',
    searchPlaceholder: 'Enter username or ID',
    noResults: 'No users found',
    sendRequest: 'Send Request',
    cancelRequest: 'Cancel Request',
    requestSent: 'Request Sent',
    accept: 'Accept',
    reject: 'Reject',
    remove: 'Remove Friend',
    empty: 'No friends yet',
    emptyTip: 'Add friends to start your guardian journey!',
    viewLocation: 'View Location'
  },
  map: {
    title: 'Map Area',
    locateMe: 'Locate Me',
    navigate: 'Navigate',
    selectUsers: 'Select Users',
    locationSuccess: 'Location updated',
    locationFailed: 'Failed to get location',
    loadFailed: 'Failed to load map',
    signalExcellent: 'GPS Signal Excellent',
    signalGood: 'GPS Signal Good',
    signalFair: 'GPS Signal Fair',
    signalPoor: 'GPS Signal Poor',
    signalNone: 'GPS No Signal',
    locatingTitle: 'Finding Your Location',
    locatingDesc: 'Getting your position via GPS',
    locatingTip: 'Please wait a moment...'
  },
  login: {
    title: 'Welcome Back',
    subtitle: 'Login to continue your guardian journey',
    username: 'Username',
    password: 'Password',
    remember: 'Remember me',
    forgot: 'Forgot password?',
    submit: 'Login',
    noAccount: "Don't have an account?",
    register: 'Register now',
    placeholder: {
      username: 'Enter your username',
      password: 'Enter your password'
    },
    error: {
      username: 'Please enter your username',
      password: 'Please enter your password',
      invalid: 'Invalid username or password'
    }
  }
} 