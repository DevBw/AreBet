import { useEffect, useRef, useCallback } from 'react';

export function usePerformance() {
  const metricsRef = useRef({
    renderCount: 0,
    renderTime: 0,
    memoryUsage: null,
    networkRequests: 0,
    errors: 0
  });

  const startTimeRef = useRef(performance.now());

  // Track render performance
  const trackRender = useCallback(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTimeRef.current;
    
    metricsRef.current.renderCount++;
    metricsRef.current.renderTime += renderTime;
    startTimeRef.current = endTime;

    // Log slow renders in development
    if (process.env.NODE_ENV === 'development' && renderTime > 16) {
      console.warn(`Slow render detected: ${renderTime.toFixed(2)}ms`);
    }
  }, []);

  // Track memory usage
  const trackMemory = useCallback(() => {
    if ('memory' in performance) {
      metricsRef.current.memoryUsage = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
  }, []);

  // Track network requests
  const trackNetworkRequest = useCallback(() => {
    metricsRef.current.networkRequests++;
  }, []);

  // Track errors
  const trackError = useCallback((error) => {
    metricsRef.current.errors++;
    
    if (process.env.NODE_ENV === 'development') {
      console.error('Performance tracked error:', error);
    }
  }, []);

  // Get performance metrics
  const getMetrics = useCallback(() => {
    const metrics = metricsRef.current;
    return {
      ...metrics,
      averageRenderTime: metrics.renderCount > 0 
        ? metrics.renderTime / metrics.renderCount 
        : 0,
      memoryUsagePercentage: metrics.memoryUsage 
        ? (metrics.memoryUsage.used / metrics.memoryUsage.limit) * 100 
        : null
    };
  }, []);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    metricsRef.current = {
      renderCount: 0,
      renderTime: 0,
      memoryUsage: null,
      networkRequests: 0,
      errors: 0
    };
    startTimeRef.current = performance.now();
  }, []);

  // Monitor performance on mount
  useEffect(() => {
    trackRender();
    trackMemory();

    // Monitor memory usage periodically
    const memoryInterval = setInterval(trackMemory, 30000); // Every 30 seconds

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Long task threshold
            console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`);
          }
        }
      });
      
      observer.observe({ entryTypes: ['longtask'] });

      return () => {
        observer.disconnect();
        clearInterval(memoryInterval);
      };
    }

    return () => clearInterval(memoryInterval);
  }, [trackRender, trackMemory]);

  return {
    trackRender,
    trackMemory,
    trackNetworkRequest,
    trackError,
    getMetrics,
    resetMetrics
  };
}

export default usePerformance;
