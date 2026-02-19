 // Polyfill navigator and clipboard API for React Native environments
 // This must run before any other imports to prevent "Cannot read 'clipboard'" errors

  console.log('[Polyfill] Initializing clipboard polyfill');

  try {
   // Log environment detection (minimal)
   console.log('[Polyfill] Environment:', {
     hasWindow: typeof window !== 'undefined',
     hasNavigator: typeof navigator !== 'undefined',
     hasDocument: typeof document !== 'undefined',
   });
  
  // Get global object safely
  let globalObj: any;
  if (typeof global !== 'undefined') {
    globalObj = global;
  } else if (typeof window !== 'undefined') {
    globalObj = window;
  } else if (typeof self !== 'undefined') {
    globalObj = self;
  } else {
    globalObj = {};
  }
  
   console.log('[Polyfill] Global object obtained');
   
   // 1. Ensure global object has window property (for web compatibility)
   if (typeof window === 'undefined' && globalObj) {
     // @ts-ignore
     globalObj.window = globalObj;
     console.log('[Polyfill] Created window on global object');
   }
  
   // 2. Ensure navigator exists
   if (typeof navigator === 'undefined') {
     const baseNavigator = {
       userAgent: 'ReactNative',
       platform: 'ReactNative',
       language: 'en-US',
       languages: ['en-US'],
       onLine: true,
     };
     
     // @ts-ignore
     globalObj.navigator = baseNavigator;
     console.log('[Polyfill] Created navigator polyfill');
   } else {
     console.log('[Polyfill] Navigator already exists');
   }
  
  // 3. Create safe clipboard object
  const safeClipboard = {
    writeText: () => Promise.resolve(),
    readText: () => Promise.resolve(''),
    read: () => Promise.resolve([]),
    write: () => Promise.resolve(),
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  };
  
   // 4. Ensure navigator.clipboard exists
   if (navigator && typeof navigator.clipboard === 'undefined') {
     try {
       // @ts-ignore
       navigator.clipboard = safeClipboard;
       console.log('[Polyfill] Created navigator.clipboard');
     } catch (err) {
       console.error('[Polyfill] Failed to create navigator.clipboard:', err);
     }
   } else if (navigator && navigator.clipboard) {
     console.log('[Polyfill] navigator.clipboard already exists');
   }
  
   // 5. Ensure document.clipboard exists (some web APIs check this)
   if (typeof document !== 'undefined') {
     try {
       // @ts-ignore
       if (!document.clipboard) {
         // @ts-ignore
         document.clipboard = safeClipboard;
         console.log('[Polyfill] Created document.clipboard');
       } else {
         console.log('[Polyfill] document.clipboard already exists');
       }
     } catch (err) {
       console.error('[Polyfill] Failed to create document.clipboard:', err);
     }
   }
  
   // 6. Ensure window.clipboard exists for completeness
   if (typeof window !== 'undefined') {
     try {
       // @ts-ignore
       if (!window.clipboard) {
         // @ts-ignore
         window.clipboard = safeClipboard;
         console.log('[Polyfill] Created window.clipboard');
       }
     } catch (err) {
       console.error('[Polyfill] Failed to create window.clipboard:', err);
     }
   }
   
   console.log('[Polyfill] Polyfill completed successfully');
  
 } catch (error: any) {
   console.error('[Polyfill] Critical error - app may crash');
   console.error('[Polyfill] Error:', error?.message || error);
   // Do NOT re-throw - let app continue even with polyfill error
 }

// Export something to prevent tree-shaking
export const _polyfill = true;