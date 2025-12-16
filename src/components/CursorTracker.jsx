import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getFriendlyName } from '../utils/friendlyname';

const CursorTracker = ({ connection }) => {
  const [otherCursors, setOtherCursors] = useState([]);
  const [isTracking, setIsTracking] = useState(true);
  const throttleRef = useRef(null);
  const lastUpdateRef = useRef(0);
  const currentUserIdentity = connection?.identity;

  // Throttle mouse updates to avoid spam (60fps = ~16ms)
  const THROTTLE_MS = 16;

  // Track mouse state
  const [mouseState, setMouseState] = useState({
    x: 0,
    y: 0,
    leftButtonDown: false,
    rightButtonDown: false,
    middleButtonDown: false,
    scrollX: 0,
    scrollY: 0,
    isDragging: false,
    hoveredElement: '',
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  });

  // Get CSS selector for hovered element
  const getElementSelector = useCallback((element) => {
    if (!element) return '';
    
    // Try to get a meaningful selector
    if (element.id) return `#${element.id}`;
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.split(' ').filter(c => c.length > 0);
      if (classes.length > 0) return `.${classes[0]}`;
    }
    return element.tagName.toLowerCase();
  }, []);

  // Send mouse state to SpacetimeDB
  const sendMouseState = useCallback((newState) => {
    if (!connection || !connection.reducers?.updateMouseState || !isTracking) return;

    try {
      connection.reducers.updateMouseState({
      x: newState.x,
      y: newState.y,
      leftButtonDown: newState.leftButtonDown,
      rightButtonDown: newState.rightButtonDown,
      middleButtonDown: newState.middleButtonDown,
      scrollX: newState.scrollX,
      scrollY: newState.scrollY,
      isDragging: newState.isDragging,
      hoveredElement: newState.hoveredElement,
      viewportWidth: newState.viewportWidth,
      viewportHeight: newState.viewportHeight,
    });
    } catch (error) {
      console.warn('Failed to send mouse state:', error);
    }
  }, [connection, isTracking]);

  // Throttled update function
  const throttledUpdate = useCallback((newState) => {
    const now = Date.now();
    if (now - lastUpdateRef.current < THROTTLE_MS) {
      // Schedule update for later
      if (throttleRef.current) clearTimeout(throttleRef.current);
      throttleRef.current = setTimeout(() => {
        sendMouseState(newState);
        lastUpdateRef.current = Date.now();
      }, THROTTLE_MS - (now - lastUpdateRef.current));
    } else {
      // Send immediately
      sendMouseState(newState);
      lastUpdateRef.current = now;
    }
  }, [sendMouseState]);

  // Mouse move handler
  const handleMouseMove = useCallback((e) => {
    const hoveredElement = getElementSelector(e.target);
    const newState = {
      ...mouseState,
      x: e.clientX,
      y: e.clientY,
      hoveredElement,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    };
    setMouseState(newState);
    throttledUpdate(newState);
  }, [mouseState, getElementSelector, throttledUpdate]);

  // Mouse button handlers
  const handleMouseDown = useCallback((e) => {
    const newState = {
      ...mouseState,
      leftButtonDown: e.button === 0 ? true : mouseState.leftButtonDown,
      rightButtonDown: e.button === 2 ? true : mouseState.rightButtonDown,
      middleButtonDown: e.button === 1 ? true : mouseState.middleButtonDown,
      isDragging: e.button === 0, // Start dragging on left click
    };
    setMouseState(newState);
    sendMouseState(newState); // Send immediately for clicks
  }, [mouseState, sendMouseState]);

  const handleMouseUp = useCallback((e) => {
    const newState = {
      ...mouseState,
      leftButtonDown: e.button === 0 ? false : mouseState.leftButtonDown,
      rightButtonDown: e.button === 2 ? false : mouseState.rightButtonDown,
      middleButtonDown: e.button === 1 ? false : mouseState.middleButtonDown,
      isDragging: false, // Stop dragging
    };
    setMouseState(newState);
    sendMouseState(newState); // Send immediately for clicks
  }, [mouseState, sendMouseState]);

  // Scroll handler
  const handleScroll = useCallback((e) => {
    const newState = {
      ...mouseState,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    };
    setMouseState(newState);
    throttledUpdate(newState);
  }, [mouseState, throttledUpdate]);

  // Set up event listeners
  useEffect(() => {
    if (!isTracking) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('scroll', handleScroll);
    
    // Handle context menu to track right clicks
    const handleContextMenu = (e) => {
      // Don't prevent default, just track the state
    };
    document.addEventListener('contextmenu', handleContextMenu);

    // Handle viewport resize
    const handleResize = () => {
      const newState = {
        ...mouseState,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      };
      setMouseState(newState);
      sendMouseState(newState);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', handleResize);
    };
  }, [isTracking, handleMouseMove, handleMouseDown, handleMouseUp, handleScroll, mouseState, sendMouseState]);

  // Subscribe to other users' cursor positions
  useEffect(() => {
    if (!connection || !connection.db?.mouseState) return;

    try {
      // Get existing cursor states
      const existingCursors = Array.from(connection.db.mouseState.iter())
        .filter(cursor => cursor.identity.toHexString() !== currentUserIdentity?.toHexString());
      setOtherCursors(existingCursors);

      // Subscribe to updates (new version)
      // Handle new cursors
      const unsubInsert = connection.db.mouseState.onInsert((ctx, mouseState) => {
        if (mouseState.identity.toHexString() !== currentUserIdentity?.toHexString()) {
          setOtherCursors(prev => {
            const filtered = prev.filter(cursor => 
              cursor.identity.toHexString() !== mouseState.identity.toHexString()
            );
            return [...filtered, mouseState];
          });
        }
      });

      // Handle cursor updates (movement)
      const unsubUpdate = connection.db.mouseState.onUpdate((ctx, oldState, newState) => {
        if (newState.identity.toHexString() !== currentUserIdentity?.toHexString()) {
          setOtherCursors(prev => {
            const filtered = prev.filter(cursor => 
              cursor.identity.toHexString() !== newState.identity.toHexString()
            );
            return [...filtered, newState];
          });
        }
      });

      return () => {
        if (typeof unsubInsert === 'function') unsubInsert();
        if (typeof unsubUpdate === 'function') unsubUpdate();
      };      
    } catch (error) {
      console.error('Error setting up cursor subscription:', error);
    }
  }, [connection, currentUserIdentity]);

  // Get color for user cursor
  const getCursorColor = useCallback((identity) => {
    const friendlyName = getFriendlyName(identity);
    const color = friendlyName.split('_')[0]; // Extract color from name like "blue_elephant"
    
    const colorMap = {
      red: '#ef4444',
      blue: '#3b82f6',
      green: '#22c55e',
      yellow: '#eab308',
      purple: '#a855f7',
      orange: '#f97316',
      pink: '#ec4899',
      white: '#f8fafc',
    };
    
    return colorMap[color] || '#6b7280'; // Default gray
  }, []);

  return (
    <>
      {/* Toggle button */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setIsTracking(!isTracking)}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            isTracking 
              ? 'bg-green-500 text-white hover:bg-green-600' 
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          👁️ {isTracking ? 'Tracking ON' : 'Tracking OFF'}
        </button>
      </div>

      {/* Other users' cursors */}
      {otherCursors.map((cursor) => {
        const friendlyName = getFriendlyName(cursor.identity);
        const color = getCursorColor(cursor.identity);
        
        return (
          <div
            key={cursor.identity.toHexString()}
            className="fixed pointer-events-none z-40 transition-all duration-75 ease-out"
            style={{
              left: `${cursor.x}px`,
              top: `${cursor.y}px`,
              transform: 'translate(-2px, -2px)',
            }}
          >
            {/* Cursor pointer */}
            <div 
              className="w-4 h-4 rotate-12 transform"
              style={{ color }}
            >
              <svg 
                viewBox="0 0 24 24" 
                fill="currentColor"
                className="w-full h-full drop-shadow-lg"
              >
                <path d="M13.64 21.97c-.16 0-.3-.07-.4-.2l-4.83-6.7c-.27-.37-.04-.99.4-.99h2.54v-8.5c0-.28.22-.5.5-.5s.5.22.5.5v9c0 .28-.22.5-.5.5h-1.64l4.13 5.73c.14.2.1.48-.1.62-.08.05-.16.08-.25.08-.14 0-.27-.06-.35-.17z"/>
              </svg>
            </div>
            
            {/* User name label */}
            <div 
              className="ml-4 -mt-3 px-2 py-1 bg-black text-white text-xs rounded shadow-lg whitespace-nowrap"
              style={{ borderLeft: `3px solid ${color}` }}
            >
              {friendlyName}
              {cursor.leftButtonDown && ' 🖱️'}
              {cursor.isDragging && ' ↕️'}
            </div>

            {/* Click animation */}
            {cursor.leftButtonDown && (
              <div 
                className="absolute -inset-2 rounded-full animate-ping"
                style={{ backgroundColor: `${color}40` }}
              />
            )}
          </div>
        );
      })}

      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && isTracking && (
        <div className="fixed bottom-4 left-4 bg-black text-white p-2 text-xs rounded font-mono">
          <div>Mouse: {mouseState.x}, {mouseState.y}</div>
          <div>Buttons: L:{mouseState.leftButtonDown ? '✓' : '✗'} R:{mouseState.rightButtonDown ? '✓' : '✗'} M:{mouseState.middleButtonDown ? '✓' : '✗'}</div>
          <div>Scroll: {mouseState.scrollX}, {mouseState.scrollY}</div>
          <div>Dragging: {mouseState.isDragging ? '✓' : '✗'}</div>
          <div>Hovered: {mouseState.hoveredElement}</div>
          <div>Others: {otherCursors.length} cursors</div>
          <div>Viewport: {mouseState.viewportWidth}x{mouseState.viewportHeight}</div>
        </div>
      )}
    </>
  );
};

export default CursorTracker;
