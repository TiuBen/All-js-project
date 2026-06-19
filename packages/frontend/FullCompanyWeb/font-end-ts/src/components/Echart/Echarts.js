import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";


const resizeObserver = new window.ResizeObserver((entries) => {
    entries.map(({ target }) => {
        const instance = echarts.getInstanceByDom(target);
        if (instance) {
            instance.resize();
        }
    });
});

function ECharts(props) {
    const { options, style, className, loading, message } = props;
    const [chart, setChart] = useState(null);
    const chartRef = useRef();

    useEffect(() => {
        const chart = echarts.init(chartRef.current, "westeros",{ renderer: 'canvas' }); // echarts theme
        chart.setOption({ ...options, resizeObserver }, true); // second param is for 'noMerge'
        setChart(chart);
        if (resizeObserver) resizeObserver.observe(chartRef.current);
    }, [options]);

    useEffect(() => {
        if (!chart) {
            return;
        }
        if (loading) {
            chart.showLoading();
            return;
        }

        chart.hideLoading();
    }, [chart, loading]);

    useEffect(() => {
        if (chart && options && message) {
            chart.clear();
        }
    }, [message]);

    const newStyle = {
        height: 200,
        ...style,
    };

    return (
        <div className="echarts-parent position-relative">
            <div ref={chartRef} style={newStyle} className={"echarts-react" + className} />
            {message ? <div className="no-data">{message}</div> : null}
        </div>
    );
}

export default React.memo(ECharts);
