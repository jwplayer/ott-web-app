Feature: Analytics - Advertisement

  # `egpovogv` config can be used

  Scenario: Watching the video from the beginning with 1 pre-roll ad (the config should have an ad-schedule)
    Given Start watching the video "Elephants Dream"
    When Watch the video with advertising from "00:00 to 00:25"
    Then Expect `i` event to be sent

  Scenario: Watching the video from the Continue Watching shelf with 1 pre-roll ad (the config should have an ad-schedule)
    Given Start watching the video "Elephants Dream" from the 3:00 minute (from Continue Watching shelf)
    When Watch the video with advertising from "03:00 to 03:25"
    Then Expect `i` event to be sent
