Feature: Analytics - Initialization

  # `225tvq1i` config can be used
  # List of expected params for `e` event: `pss`, `oos`, `oosv`, `sdk`, `aid`, `bun`, `fed`, `id`, `t`, `emi`, `pli`, `oaid` (if subscription enabled)
  # List of expected params for `s` event: `pss`, `oos`, `oosv`, `sdk`, `aid`, `bun`, `fed`, `id`, `t`, `emi`, `pli`, `ti`, `pw`, `q`, `oaid` (if subscription enabled)
  # Params which have constant values and need to be redifined manually: `pss`, `oos`, `oosv`, `sdk`

  Scenario: Watching the video from the beginning (`e` event)
    Given Start watching the video "Elephants Dream" (`e` event)
    When Watch the video from "00:00 to 00:05"
    Then Expect `e` event to be the first event sent
    Then Expect `e` event to be sent with params from the list in the comment above
    Then Expect sent params to have correct values

  Scenario: Watching the video from the Continue Watching section (`e` event)
    Given Start watching the video "Elephants Dream" from Continue Watching (`e` event)
    When Watch the video from "03:00 to 03:05"
    Then Expect `e` event to be the first event sent
    Then Expect `e` event to be sent with params from the list in the comment above
    Then Expect sent params to have correct values

  Scenario: Watching the video from the beginning (`s` event)
    Given Start watching the video "Elephants Dream" (`s` event)
    When Watch the video from "00:00 to 00:05"
    Then Expect `s` event to be the second event sent (if no ad-schedule is used)
    Then Expect `s` event to be sent with params from the list in the comment above
    Then Expect `q` param to reflect the number of quantiles, `ti` to equal 0 and `pw` to equal 0 as well. 
    Then Expect other params from the list to have correct values

  Scenario: Watching the the video from the Continue Watching section (`s` event)
    Given Start watching the video "Elephants Dream" Continue Watching (`s` event)
    When Watch the video from "03:00 to 03:05"
    Then Expect `s` event to be the second event sent (if no ad-schedule is used)
    Then Expect `s` event to be sent with params from the list in the comment above
    Then Expect `q` param to reflect the number of quantiles, `ti` to equal 0 and `pw` to equal 0 as well. 
    Then Expect other sent params to have correct values
