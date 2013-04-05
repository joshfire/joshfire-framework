/**
 * @fileOverview Implementation of a "slide" panel for Samsung TVs.
 *
 * In theory, a slide panel is a card panel that animates the transition
 * between the child view that is currently displayed and the the child
 * view that the caller wants to display.
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