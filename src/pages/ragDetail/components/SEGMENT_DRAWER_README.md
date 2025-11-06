# Segment Drawer Feature

## Overview

This feature adds a drawer component that displays segment details and trace logs when clicking the "分段详情" or "溯源日志" buttons on segment cards.

## Components

### 1. SegmentDrawer (`SegmentDrawer.tsx`)

Main drawer component that:

- Opens from the right side of the screen
- Shows title "分段信息"
- Has segment navigation (previous/next buttons with current segment index)
- Contains tabs for "分段详情" and "溯源日志"
- Automatically switches to the appropriate tab based on which button was clicked

**Props:**

- `visible`: Controls drawer visibility
- `onClose`: Callback when drawer is closed
- `defaultActiveTab`: Which tab to show by default ('detail' | 'trace')
- `currentSegmentIndex`: Current segment number
- `totalSegments`: Total number of segments

### 2. TraceLog (`TraceLog.tsx`)

Trace log tab content that displays:

- **Statistics Cards** (3 cards in a row):
  - Total Nodes (总节点量) - Blue gradient background
  - Success Nodes (成功节点) - Green gradient background
  - Total Processing Time (总处理时间) - Purple gradient background
- **Node Details Section**: List of collapsible node panels

**Features:**

- Uses SVG backgrounds from `src/assets/rag/`:
  - `all-node-bg.svg` & `all-node-icon.svg`
  - `success-node-bg.svg` & `success-node-icon.svg`
  - `all-time-bg.svg` & `all-time-icon.svg`

### 3. CollapsibleNodePanel (`CollapsibleNodePanel.tsx`)

Custom collapsible panel for each node that shows:

- **Header** (always visible):
  - Left: Node index, name, status (success/failed with colored indicator)
  - Right: Processing duration, start time, expand/collapse icon
- **Expanded Content**:
  - Input section (left half)
  - Output section (right half)
  - Both sections show JSON data with:
    - Max height of 400px
    - Scrollable content
    - Copy button on hover
    - Equal width split (50/50)

**Features:**

- Custom collapse icons from `src/assets/rag/`:
  - `up-collapse.svg` (when expanded)
  - `down-collapse.svg` (when collapsed)
- Copy to clipboard functionality with success message
- Hover effect to show copy button

### 4. SegmentCardActions (`SegmentCardActions.tsx`)

Updated to:

- Import and render `SegmentDrawer`
- Open drawer when "分段详情" or "溯源日志" buttons are clicked
- Pass appropriate `defaultActiveTab` based on which button was clicked
- Manage drawer visibility state

## Mock Data

### traceLogMockData.ts

Contains mock data for:

- `TraceLogStatistics`: Total nodes, success nodes, total time
- `NodeDetail[]`: Array of node details with:
  - Node metadata (id, index, name, status, duration, startTime)
  - Input JSON data
  - Output JSON data

**Sample nodes:**

1. "开始" - Success
2. "文档解析" - Success
3. "增强" - Failed

## Usage

When a user clicks on "分段详情" or "溯源日志" button on a segment card:

1. The drawer opens from the right side
2. The appropriate tab is automatically selected
3. User can navigate between segments using prev/next buttons
4. User can switch between tabs
5. In the trace log tab:
   - Statistics are displayed at the top
   - Node details can be expanded/collapsed
   - JSON data can be copied by hovering and clicking the copy button

## Styling

- Uses Tailwind CSS for styling
- Uses Arco Design components (Drawer, Tabs)
- Custom colors:
  - Blue: `#007DFA` (primary action color)
  - Green: Success indicator
  - Red: Failed indicator
  - Gray: Neutral backgrounds and text

## Future Enhancements

1. Implement "分段详情" tab content
2. Connect to real API instead of mock data
3. Add loading states
4. Add error handling
5. Add pagination for large number of nodes
6. Add search/filter functionality for nodes
