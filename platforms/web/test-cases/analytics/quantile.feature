Feature: Analytics - Quantiles

  # It is possible to see differences in `ti` param value equalling to 1-2 seconds.
  # `225tvq1i` config can be used

  Scenario: Watching the video from the beginning with 1 fast-forwad
    Given Start watching the video "Elephants Dream"
    When Watch the video from "00:00 to 00:25"
    Then Expect `t` event to be send with a value of 20 as `ti` param
    When Fast-forward the video from "00:25 to 07:00"
    Then Expect `vs` event to be send
    When Watch the video from "7:00 to 7:15"
    Then Expect `t` event to be send with a value of 14 as `ti` param

  Scenario: Watching the video from the Continue Watching shelf with 1 rewind action
    Given Start watching the video "Elephants Dream" from the 6:00 minute (from Continue Watching shelf)
    When Watch the video from "06:00 to 06:35"
    Then Expect 2 `t` events to be sent with values of 8 and 20 as `ti` param
    When Rewind the video from "6:35 to "02:00"
    Then Expect `vs` event to be send
    When Watch the video from "2:00 to 2:15"
    Then Expect `t` event to be send with a value of 10 as `ti` param

  Scenario: Watching the video from the beginning with 1 fast-forwad and 1 rewind actions
    Given Start watching the video "Elephants Dream"
    When Watch the video from "00:00 to 00:25"
    Then Expect `t` event to be send with a value of 20 as `ti` param
    When Fast-forward the video from "00:25 to 07:00"
    Then Expect `vs` event to be send
    When Watch the video from "7:00 to 7:15"
    Then Expect `t` event to be send with a value of 14 as `ti` param
    When Rewind the video from "7:15 to "02:00"
    Then Expect `vs` event to be send
    When Watch the video from "2:00 to 2:15"
    Then Expect `t` event to be send with a value of 9 as `ti` param

  Scenario: Watching the video from the Continue Watching shelf with 1 fast-forwad and 1 rewind actions
    Given Start watching the video "Elephants Dream" from the 3:00 minute (from Continue Watching shelf)
    When Watch the video from "03:00 to 03:30"
    Then Expect 2 `t` events to be sent with values of 4 and 20 as `ti` param
    When Fast-forward the video from "03:30 to 06:00"
    Then Expect `vs` event to be sent
    When Watch the video from "06:00 to 06:35"
    Then Expect 2 `t` events to be sent with values of 14 and 20 as `ti` param
    When Rewind the video from "6:35 to "02:00"
    Then Expect `vs` event to be sent
    When Watch the video from "2:00 to 2:15"
    Then Expect `t` event to be sent with a value of 10 as `ti` param

  Scenario: Watching the video from the beginning with 1 fast-forwad and video closing
    Given Start watching the video "Elephants Dream"
    When Watch the video from "00:00 to 00:25"
    Then Expect `t` event to be sent with a value of 20 as `ti` param
    When Fast-forward the video from "00:25 to 07:00"
    Then Expect `vs` event to be sent
    When Watch the video from "7:00 to 7:15"
    Then Expect `t` event to be sent with a value of 14 as `ti` param
    When Click on "Back" button
    Then Expect `gab` event to be sent

  Scenario: Watching the video from the Continue Watching shelf till the end
    Given Start watching the video "Elephants Dream" from the 10:00 minute (from Continue Watching shelf)
    When Watch the video from "10:00 to 10:53"
    Then Expect 3 `t` events to be sent with values of 12, 20 and 20 as `ti` param
    Then Expect `gab` event to be sent
 
 Scenario: Watching Live Stream and rewinding
    Given Start watching "Channel 1" from any point
    When Watch 25 seconds of the stream
    Then Expect 1 `t` event to be sent with a value of 20 as `ti` param
    When Rewind the video 2 minutes before the current point
    Then Expect `vs` event to be sent
    When Watch 20 seconds of video
    Then Expect 1 `t` event to be sent with a value of 20 as`ti` param
