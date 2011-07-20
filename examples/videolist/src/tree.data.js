/*!
 * Joshfire Framework 0.9.1
 * http://framework.joshfire.com/
 *
 * Copyright 2011, Joshfire
 * Dual licensed under the GPL Version 2 and a Commercial license.
 * http://framework.joshfire.com/license
 *
 * Date: Wed Jul 20 20:23:43 2011
 */

Joshfire.define(['joshfire/class', 'joshfire/tree.data'], function(Class, DataTree) {
  return Class(DataTree, {

    buildTree: function() {
      // original feed : the TED talks http://feeds.feedburner.com/tedtalks_video
      return [{
        'id': 'videos',
        'children': function(query,childCallback) {
          var oVideos = [
            {
              id: 1, type: 'video',
              label: 'Jessi Arrington: Wearing nothing new',
              url: 'http://feedproxy.google.com/~r/TEDTalks_video/~5/xrADR7HNA3I/JessiArrington_2011A.mp4',
              mime: 'video/mp4',
              image: 'http://images.ted.com/images/ted/c22d7ba42f3e8c7780175ee5a48d9fb7480f48cc_615x461.jpg'

            },
            {
              id: 2, type: 'video',
              label: 'Aaron O\'Connell: Making sense of a visible quantum object',
              url: 'http://feedproxy.google.com/~r/TEDTalks_video/~5/eyCWfUUqIYg/AaronOConnell_2011.mp4',
              mime: 'video/mp4',
              image: 'http://images.ted.com/images/ted/5641574d15f0adf70194a6fe22fb7b0cc8d0c899_615x461.jpg'
            },
            {
              id: 3, type: 'video',
              label: 'Dennis Hong: Making a car for blind drivers',
              url: 'http://feedproxy.google.com/~r/TEDTalks_video/~5/J40QA0Tg2Wc/DennisHong_2011.mp4',
              mime: 'video/mp4',
              image: 'http://images.ted.com/images/ted/8dd859696a6c640e7ee3c0feaa3d3d16f647334b_615x461.jpg'
            },
            {
              id: 4, type: 'video',
              label: 'Robert Gupta and Joshua Roman duet on "Passacaglia"',
              url: 'http://feedproxy.google.com/~r/TEDTalks_video/~5/KeQ-irDgMK8/RobertGupta_2011U.mp4',
              mime: 'video/mp4',
              image: 'http://images.ted.com/images/ted/1c53e6d17512a3a28f27cce961ea777ac5981d14_615x461.jpg'
            },
            {
              id: 5, type: 'video',
              label: 'Mustafa Akyol: Faith versus tradition in Islam',
              url: 'http://feedproxy.google.com/~r/TEDTalks_video/~5/aaYFsgfaku0/MustafaAkyol_2011X.mp4',
              mime: 'video/mp4',
              image: 'http://images.ted.com/images/ted/8654b588131745216ae8b3b8f029fb4081e98b32_615x461.jpg'
            },
            {
              id: 6, type: 'video',
              label: 'Shirin Neshat: Art in exile',
              url: 'http://feedproxy.google.com/~r/TEDTalks_video/~5/9EqHewF6FFc/ShirinNeshat_2010W.mp4',
              mime: 'video/mp4',
              image: 'http://images.ted.com/images/ted/7ace398d203880542ee7610170e6286dccdaf4f3_615x461.jpg'
            },
            {
              id: 7, type: 'video',
              label: 'Bruce Aylward: How we\'ll stop polio for good',
              url: 'http://feedproxy.google.com/~r/TEDTalks_video/~5/9EqHewF6FFc/ShirinNeshat_2010W.mp4',
              mime: 'video/mp4',
              image: 'http://images.ted.com/images/ted/55e8224d694fec895e6f95aa6fad6ee7fe091bb7_615x461.jpg'
            },
            {
              id: 8, type: 'video',
              label: 'Aaron Koblin: Artfully visualizing our humanity',
              url: 'http://feedproxy.google.com/~r/TEDTalks_video/~5/N2JHceh_1Lk/AaronKoblin_2011.mp4',
              mime: 'video/mp4',
              image: 'http://images.ted.com/images/ted/1c3f327a456360b2846b9ee8f15788ef99f93dd8_615x461.jpg'
            },
            {
              id: 9, type: 'video',
              label: 'Terry Moore: How to tie your shoes',
              url: 'http://feedproxy.google.com/~r/TEDTalks_video/~5/W0XY0D3hub0/TerryMoore_2005.mp4',
              mime: 'video/mp4',
              image: 'http://images.ted.com/images/ted/01ea6a971845b61a7ec10580cf93de8c6352a41b_615x461.jpg'
            },
            {
              id: 10, type: 'video',
              label: 'Edith Widder: The weird, wonderful world of bioluminescence',
              url: 'http://feedproxy.google.com/~r/TEDTalks_video/~5/-eL5Qxudza8/EdithWidder_2011.mp4',
              mime: 'video/mp4',
              image: 'http://images.ted.com/images/ted/7bc7813215ad701161bf50a332b1ae7d2d6b17d6_615x461.jpg'
            },
            {
              id: 11, type: 'video',
              label: 'Elliot Krane: The mystery of chronic pain',
              url: 'http://feedproxy.google.com/~r/TEDTalks_video/~5/8UaJwJUJPvQ/ElliotKrane_2011U.mp4',
              mime: 'video/mp4',
              image: 'http://images.ted.com/images/ted/3b9ae36bd99e063d7bde35303636e6e75bcdd776_615x461.jpg'
            },
            {
              id: 12, type: 'video',
              label: 'Thomas Heatherwick: Building the Seed Cathedral',
              url: 'http://feedproxy.google.com/~r/TEDTalks_video/~5/g0CAgjHj3cQ/ThomasHeatherwick_2011.mp4',
              mime: 'video/mp4',
              image: 'http://images.ted.com/images/ted/21138135ad7349568c4b87354201bc917917713e_615x461.jpg'
            },
            {
              id: 13, type: 'video',
              label: 'Ed Boyden: A light switch for neurons',
              url: 'http://feedproxy.google.com/~r/TEDTalks_video/~5/4IL3W3M6SGU/EdBoyden_2011.mp4',
              mime: 'video/mp4',
              image: 'http://images.ted.com/images/ted/29fe2e14406be124c2d750736328ef617a156e10_615x461.jpg'
            },
            {
              id: 14, type: 'video',
              label: 'Leonard Susskind: My friend Richard Feynman',
              url: 'http://feedproxy.google.com/~r/TEDTalks_video/~5/mbZCJcjI3lM/LeonardSusskind_2010X.mp4',
              mime: 'video/mp4',
              image: 'http://images.ted.com/images/ted/5efc8dbe4963321ede8d64c6398b94eb5a9797a0_615x461.jpg'
            },
            {
              id: 15, type: 'video',
              label: 'Amit Sood: Building a museum of museums on the web',
              url: 'http://feedproxy.google.com/~r/TEDTalks_video/~5/kGeFGiapBMA/AmitSood_2011.mp4',
              mime: 'video/mp4',
              image: 'http://images.ted.com/images/ted/8fd3b09ba1c33ae535853952a86d240ea327ae2f_615x461.jpg'
            },
            {
              id: 16, type: 'video',
              label: 'Ron Gutman: The hidden power of smiling',
              url: 'http://feedproxy.google.com/~r/TEDTalks_video/~5/ruJ_Bej8XR0/RonGutman_2011U.mp4',
              mime: 'video/mp4',
              image: 'http://images.ted.com/images/ted/13b119d43c21a346c69e63d830c77f096981a214_615x461.jpg'
            }
          ];
          // just to emulate an asynchronous call
          setTimeout(function() {childCallback(null, oVideos);}, 2000);

        }
      }];
    }
  });
});
