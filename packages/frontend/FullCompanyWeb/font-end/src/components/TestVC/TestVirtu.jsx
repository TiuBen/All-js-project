import React, { Component } from "react";
import { Grid, AutoSizer, List, WindowScroller } from "react-virtualized";
import "react-virtualized/styles.css"; // only needs to be imported once

const list = [
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
    ["Brian Vaughn", "Software Engineer", "San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125,"San Jose", "CA", 95125 /* ... */],
  // And so on...
];
function cellRenderer({ columnIndex, key, rowIndex, style }) {
    return (
        <div key={key} style={style}>
            {list[rowIndex][columnIndex]}
            {/* {"pppp " + key} */}
        </div>
    );
}

const list2 = [
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    "Brian Vaughn",
    // And so on...
];

function rowRenderer({ key, index, style }) {
    return (
        <div key={key} style={style}>
            {list2[index]}
        </div>
    );
}

// Render your grid

export default function TestVirtu() {
    return (
        <div style={{ border: "1px red solid" }}>
            test
            {/* <List height={600} rowCount={list2.length} rowHeight={20} rowRenderer={rowRenderer} width={800} /> */}
            <div>fasfasdf</div>
            {/* <AutoSizer>
                {({ height, width }) => {
                    // <Grid
                    //     cellRenderer={cellRenderer}
                    //     columnCount={list[0].length}
                    //     rowCount={list.length}
                    //     columnWidth={50}
                    //     rowHeight={20}
                    //     height={height}
                    //     width={width}
                    // />;

                    <List
                        autoHeight={true}
                        // height={height}
                        rowCount={list2.length}
                        rowHeight={25}
                        rowRenderer={rowRenderer}
                        width={width}
                    />;
                }}
            </AutoSizer>
            <Grid
                cellRenderer={cellRenderer}
                columnCount={list[0].length}
                columnWidth={120}
                height={300}
                rowCount={list.length}
                rowHeight={40}
                width={300}
                autoContainerWidth={true}
                // autoHeight={true}
            /> */}
            <WindowScroller>
                {({ height, width,isScrolling, onChildScroll, scrollTop }) => (
                    <Grid
                        cellRenderer={cellRenderer}
                        columnCount={list[0].length}
                        columnWidth={120}
                        height={height}
                        rowCount={list.length}
                        rowHeight={40}
                        width={width}
                        autoContainerWidth={true}
                        autoHeight={true}
                        autoWidth={true}
                    />
                )}
            </WindowScroller>
        </div>
    );
}

// import {AutoSizer, List, CellMeasurer, CellMeasurerCache} from 'react-virtualized';

// const ScreenInfo = ({width, height}) => (<span>width: {width} height: {height}</span>);

// export default class TestVirtu extends Component {

//     constructor(props) {
//         super(props);
//         this.cache = new CellMeasurerCache({
//             fixedWidth: true,
//             defaultHeight: 50
//         });
//     }
//     renderRow = ({key, isScrolling, parent, style, index}) => {
//         return (
//         <CellMeasurer
//             key={key}
//             cache={this.cache}
//             parent={parent}
//             columnIndex={0}
//             rowIndex={index}
//         >
//             <div style={style} >
//                 name: {this.props.data[index].name}
//                 email: {this.props.data[index].email}
//                 height: <div style={{height: `${this.props.data[index].randomHeight}px`}}>{this.props.data[index].randomHeight}px</div>
//             </div>
//         </CellMeasurer>
//         );
//     };

//     render() {
//         return (
//             <AutoSizer>
//                 {({width, height}) => {
//                     return (
//                         <div>
//                             <ScreenInfo width={width} height={height}/>
//                             <List
//                                 rowCount={this.props.data.length}
//                                 deferredMeasurementCache={this.cache}
//                                 rowHeight={this.cache.rowHeight}
//                                 rowRenderer={this.renderRow}
//                                 width={width}
//                                 height={height}
//                             />

//                         </div>
//                     );
//                 }}
//             </AutoSizer>
//         );
//     }
// }
