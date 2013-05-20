/*!
 * Joshfire Framework 0.9.1
 * http://framework.joshfire.com/
 *
 * Copyright 2013, Joshfire, licensed under an MIT license
 * http://framework.joshfire.com/license
 */
/*global console*/

define([
  'joshlib!utils/dollar',
  'joshlib!utils/onready',
  'joshlib!vendor/backbone',
  'joshlib!ui/list'
], function (
  $,
  onReady,
  Backbone,
  List
) {

  var categories = new Backbone.Collection();

  categories.add({
    name : 'Sci-Fi',
    books : new Backbone.Collection([{
      title : 'The Forever War',
      author : 'Joe Haldeman'
    },{
      title : '20,000 Leagues Under the Sea',
      author : 'Jules Verne'
    }])
  });

  categories.add({
    name : 'Romance',
    books : new Backbone.Collection([{
      title : 'Pride and Prejudice ',
      author : 'Jane Austen'
    },{
      title : 'Jane Eyre',
      author : 'Charlotte Brontë'
    }])
  });

  categories.add({
    name : 'Empty category',
    books : new Backbone.Collection()
  });

  onReady(function () {
    var list = new List({
      collection : categories,
      itemFactory : function (category) {
        return new List({
          collection : category.get('books'),
          data : {
            // expose the parent model to the nested list
            category : category
          },
          template : '<h2><%= category.get("name") %></h2><ul><%= children %></ul>',
          itemTemplate : '<em><%= item.title %></em> by <strong><%= item.author %></strong>'
        });
      }
    });

    list.render();
    list.$el.appendTo(document.body);
  });
});
