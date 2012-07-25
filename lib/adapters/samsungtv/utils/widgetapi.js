define([], function() {
  try {
    return new Common.API.Widget();
  } catch(e) {
    return null;
  }
});
