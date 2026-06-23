/**
 * Status bar utilities for Capacitor (Android/iOS).
 * Handles immersive mode and style adaptation per theme.
 */

const isCapacitor = (): boolean => {
  return typeof (window as any)?.Capacitor !== 'undefined';
};

export const initStatusBar = async () => {
  if (!isCapacitor()) return;
  
  try {
    const { StatusBar } = await import('@capacitor/status-bar');
    
    // Enable overlay mode so content draws behind status bar
    await StatusBar.setOverlaysWebView({ overlay: true });
    
    // Set transparent background
    await StatusBar.setBackgroundColor({ color: '#00000000' });
  } catch (err) {
    console.warn('StatusBar plugin not available:', err);
  }
};

export const updateStatusBarStyle = async (isDarkTheme: boolean) => {
  if (!isCapacitor()) return;
  
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    
    // Dark theme → white text (Style.Dark); Light theme → black text (Style.Light)
    await StatusBar.setStyle({ 
      style: isDarkTheme ? Style.Dark : Style.Light 
    });
  } catch (err) {
    console.warn('StatusBar style update failed:', err);
  }
};
