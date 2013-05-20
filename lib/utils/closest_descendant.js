define(['joshlib!utils/dollar'], function ($) {
  /**
   * Returns the closest descendant of a jQuery set which matches a selector
   *
   * Use this instead of jQuery.find().first() when you don't want to match
   * a nested element
   *
   * The closest element is the one whose depth & position are the lowest
   * Example:
   * <div>
   *   <div>
   *     <span> 1 </span>
   *     <span> 2 </span>
   *   </div>
   *   <span> 3 </span>
   *   <span> 4 </span>
   * </div>
   *
   * closest_descendant(el, 'span') will return the 3rd span
   *
   * @function
   * @param {element|string|jQuery object} A DOM element, a jQuery set or a selector
   * @param {string} The selector used to filter the descendants
   * @return {jQuery object} the closest descendant (may be an empty jQuery object)
   */

  var closest_descendant = function($set, selector) {
    $set = $($set); // ensures we deal with a jQuery set
    var $found = $(); // empty set
    while ($set.length) {
      // search the current set
      $found = $set.filter(selector);
      // stop if one is found
      if ($found.length) break;
      // replace the current set by the children of all item in the set
      $set = $set.children();
    }
    return $found.first();
  };

  return closest_descendant;
});
