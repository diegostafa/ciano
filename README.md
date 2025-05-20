# Ciano

A react native frontend for [Blu](https://github.com/diegostafa/blu)

run with:

- `npm install`
- `npx react-native start`
- `npx react-native run-android`

todo:

- app:
  - [ ] add app icon
  - [ ] splash screen
  - [ ] storage permissions to download media
  - [ ] better error handling and messages
- history:
  - [ ] add button to clear the history
  - [ ] add input to filter the history
- settings:
  - [ ] fill the various sections (appearance, accessibility ...)
- thread:
  - [ ] sort and filter the thread
  - [ ] when opening a thread, reset the notification counter
- notifications:
    - show notification indicator in bottom nav
    - keep a list of threads, each items should only shows a signature
    - watcher { threadId, new,}
- gallery:
  - [ ] tap and hold for a menu (download, copy name, copy link, share)
