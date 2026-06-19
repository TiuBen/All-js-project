import dayjs from "dayjs";
import React from "react";

function TimelineItem({ timestamp, title, subtitle, content }) {
    return (
        <li class="mb-5 ml-4 font-body">
            <div class="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
            <time class="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                {dayjs(timestamp).format("HH:mm D/MM/YYYY")}
            </time>
            <h3 class="text-lg font-semibold text-gray-700 dark:text-white">
                {title}- <span className="text-sm">{subtitle}</span> 
            </h3>
            <p class="text-base font-normal text-gray-400 dark:text-gray-400">{content}</p>
        </li>
    );
}

function VerticalTimeline(props) {
    const { items } = props;
    console.log(props);
    const timelineData = [
        {
          title: 'Event 1',
          time: '2023-07-21',
          content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        },
        {
          title: 'Event 2',
          time: '2023-07-23',
          content: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        },
        // Add more timeline data items here
      ];

    return (
        <ol class="relative border-l border-gray-200 dark:border-gray-700">
            {Array.isArray(props?.items) ? (
                items.map((x, index) => {
                    return (
                        <TimelineItem key={index}
                            timestamp={x.timestamp}
                            title={x.title}
                            subtitle={x.subTitle}
                            content={x.content}
                        />
                    );
                })
            ) : (
                <div>空空如也</div>
            )}
        </ol>
    );
}

export default VerticalTimeline;
