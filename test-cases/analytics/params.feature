Feature: Analytics - Initialization

  # `225tvq1i` config can be used

  Scenario: Watching the video from the beginning with SVOD access model (`e` event)
    Given Start watching the video "Elephants Dream"
    When Watch the video from "00:00 to 00:30"
    Then Expect `e`, `s` and `t` events to be sent with `oaid` param
    Then Expect `oaid` to equal the id of the client

  Scenario: Watching the video from the beginning, opening it from the Home page
    Given Click on "Elephants Dream" card on the Home page
    When Watch the video from "00:00 to 00:30"
    Then Expect `e`, `s` and `t` events to be sent with `fed` param
    Then Expect `fed` to equal the playlist which includes "Elephants Dream" video

  Scenario: Watching the video from the beginning, opening it from the Continue Watching section
    Given Click on "Elephants Dream" card on the Home page (Continue Watching section)
    When Watch 30 seconds of the video
    Then Expect `e`, `s` and `t` events to be sent with `fed` param
    Then Expect `fed` to equal `continueWatchingList` id of the app config
