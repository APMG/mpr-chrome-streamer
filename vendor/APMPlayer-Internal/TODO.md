TODO
====

* Check playlist on mobile.
* Figure out what should happen when the user scrubs. Should 'end_time' be ignored? What about 'start_time'?
* Should the duration and start time of the play bar be influenced by this?
* Should the start and end time of the playable persist across playlist playback?
* What happens when the second item in a playlist has a start and end time?
* Check auto-play
* What happens if the playable start and end times are modified later?
* How many segments work? Is there a scalability issue?
* Make sure that the segments are in ascending order of time. Line 790

Make sure that clicking around segments works. Even when paused and on a different playable. Also check initial click after load.