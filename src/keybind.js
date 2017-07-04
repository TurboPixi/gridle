const keybind = (code, downFunc = () => null, upFunc = () => null) => {
  const key = {};
  key.code = code;
  key.isDown = false;

  key.downHandler = (event) => {
    if (event.keyCode === key.code) {
      event.preventDefault();
      downFunc();
      key.isDown = true;
    }
  };

  key.upHandler = (event) => {
    if (event.keyCode === key.code) {
      event.preventDefault();
      upFunc();
      key.isDown = false;
    }
  };

  window.addEventListener('keydown', key.downHandler.bind(key), false);
  window.addEventListener('keyup', key.upHandler.bind(key), false);
  return key;
};

export default keybind;
