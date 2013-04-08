/**
 * @fileOverview Implementation of a "fade in" panel for Samsung TVs.
 *
 * In practice, CSS animations are barely supported on Samsung TV and do not
 * perform well enough when supported. There is thus no real way to animate
 * the transition on a Samsung TV. This adapter thus merely exposes the TV
 * version of the CardPanel view.
 */
define([
  'joshlib!adapters/tv/ui/cardpanel'
], function (CardPanel) {
  return CardPanel;
});