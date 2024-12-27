export default {
  appName: '星の守護',
  nav: {
    map: '地図',
    friends: '友達',
    profile: 'プロフィール'
  },
  notification: {
    title: '通知',
    markAllAsRead: 'すべて既読',
    empty: '通知なし',
    online: '{name}さんがオンラインになりました',
    offline: '{name}さんがオフラインになりました',
    locationShared: '{name}さんが位置情報を共有しました',
    timeAgo: {
      justNow: 'たった今',
      minutesAgo: '{minutes}分前',
      hoursAgo: '{hours}時間前',
      daysAgo: '{days}日前'
    }
  },
  profile: {
    title: 'プロフィール',
    settings: 'アカウント設定',
    privacy: 'プライバシー設定',
    notifications: '通知',
    about: '会社概要',
    logout: 'ログアウト',
    logoutConfirm: {
      title: 'ログアウトの確認',
      message: 'ログアウト後は再度ログインが必要です',
      confirm: 'ログアウト',
      cancel: 'キャンセル'
    },
    stats: {
      guardian: '保護者',
      beingGuarded: '保護されている'
    },
    language: '言語',
    languages: {
      zh: '简体中文',
      en: 'English',
      ko: '한국어',
      ja: '日本語'
    },
    languageChanged: '言語が更新されました',
    logoutSuccess: 'ログアウトしました'
  },
  common: {
    id: 'ID',
    loading: '読み込み中...',
    error: 'エラーが発生しました',
    retry: '再試行',
    confirm: '確認',
    cancel: 'キャンセル',
    save: '保存',
    edit: '編集',
    delete: '削除'
  },
  userStatus: {
    online: 'オンライン',
    offline: 'オフライン',
    noLocation: '位置情報なし',
    moving: '移動中'
  },
  friends: {
    search: '友達を検索',
    add: '友達を追加',
    searchPlaceholder: 'ユーザー名またはIDを入力',
    noResults: 'ユーザーが見つかりません',
    sendRequest: '友達リクエストを送信',
    cancelRequest: 'リクエストをキャンセル',
    requestSent: 'リクエスト送信済み',
    accept: '承認',
    reject: '拒否',
    remove: '友達を削除',
    empty: '友達がいません',
    emptyTip: '友達を追加して守護の旅を始めましょう！',
    viewLocation: '位置を表示'
  },
  map: {
    title: '地図エリア',
    locateMe: '現在地を表示',
    navigate: 'ナビゲート',
    selectUsers: 'ユーザーを選択',
    locationSuccess: '位置情報の取得に成功しました',
    locationFailed: '位置情報の取得に失敗しました。位置情報の権限を確認してください',
    loadFailed: '地図の読み込みに失敗しました。更新して再試行してください'
  },
  login: {
    title: 'おかえりなさい',
    subtitle: 'ログインして守護の旅を続けましょう',
    username: 'ユーザー名',
    password: 'パスワード',
    remember: 'ログイン情報を保存',
    forgot: 'パスワードをお忘れですか？',
    submit: 'ログイン',
    noAccount: 'アカウントをお持ちでない方',
    register: '今すぐ登録',
    placeholder: {
      username: 'ユーザー名を入力',
      password: 'パスワードを入力'
    },
    error: {
      username: 'ユーザー名を入力してください',
      password: 'パスワードを入力してください',
      invalid: 'ユーザー名またはパスワードが正しくありません'
    }
  }
} 