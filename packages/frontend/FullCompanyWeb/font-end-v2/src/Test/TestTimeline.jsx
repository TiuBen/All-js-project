import React from 'react'
import VerticalTimeline from '../Components/Timeline/VerticalTimeline'
import {TestTimelineData} from '../utils/TestData/TimelineData';

function TestTimeline() {
  return (
    <div>
        <VerticalTimeline items={TestTimelineData} test={"123"}/>
    </div>
  )
}

export default TestTimeline