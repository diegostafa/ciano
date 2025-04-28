# Ciano

A react native frontend for [Blu](https://github.com/diegostafa/blu)

run with:
- `npm install`
- `npx react-native start`
- `npx react-native run-android`

todo:
- app:
    - [] add app icon
    - [] splash screen
    - [] storage permissions to download media
    - [] dark and light themes
- history:
    - [] add button to clear the history
    - [] add input to filter the history
- settings:
    - [] fill the various sections (appearance, accessibility ...)
- catalog:
    - [] hide FAB when scrolling down
    - [] fix FAB icon
    - [] create thread form (on a separate screen)
- thread:
    - [] hide FAB when scrolling down
    - [] fix Fab icon
    - [] swipe to reply
    - [] tap and hold for a menu (quote, quote text, copy text)
    - [] spawn the context menu near the comment
    - [] mark comments as yours (keep a list of IDs)
    - [] use relative dates (config option)
    - [] gracefully check the thread for new comments
    - [] snackbar notification upon receiving new comments
    - [] give a different style to comments contained in state.myComments
    - [] replace every `>>id` with `>>id (you)` when `id` is contained in state.myComments
- gallery:
    - [] gallery for catalog and thread images
    - [] tap and hold for a menu (download, copy name, copy link, share)