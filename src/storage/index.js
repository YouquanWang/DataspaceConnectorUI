
const locale = extend('i18nextLng', localStorage)
function setData (key, value, storage = localStorage) {
  try {
    storage.setItem(key, value)
  } 
  catch(e) {
    console.log(e)
  }
}
function extend (key, storage = localStorage) {
  return {
    get () {
      return storage.getItem(key)
    },
    set (value) {
      setData(key, value, storage)
    },
    remove () {
      storage.removeItem(key)
    }
  }
}
export {
  locale
}