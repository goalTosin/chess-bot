function randItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function wrap(f,v) {
  return f(v)
}

export {randItem,wrap}