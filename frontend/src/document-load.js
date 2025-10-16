// eslint-disable
// const navEntry = performance.getEntriesByType('navigation')[0];

// function toOtelTime(msSinceNavStart) {
//   // Convert ms since navigation start to absolute ms
//   const absoluteMs = performance.timeOrigin + msSinceNavStart;
//   const seconds = Math.floor(absoluteMs / 1000);
//   const nanoseconds = Math.round((absoluteMs % 1000) * 1e6);
//   return [seconds, nanoseconds];
// }

// // Navigation timings in OpenTelemetry format
// if (navEntry) {
//   const timings = {
//     fetchStart: toOtelTime(navEntry.fetchStart),
//     domainLookupStart: toOtelTime(navEntry.domainLookupStart),
//     domainLookupEnd: toOtelTime(navEntry.domainLookupEnd),
//     connectStart: toOtelTime(navEntry.connectStart),
//     secureConnectionStart: toOtelTime(navEntry.secureConnectionStart),
//     connectEnd: toOtelTime(navEntry.connectEnd),
//     requestStart: toOtelTime(navEntry.requestStart),
//     responseStart: toOtelTime(navEntry.responseStart),
//     responseEnd: toOtelTime(navEntry.responseEnd),
//     domInteractive: toOtelTime(navEntry.domInteractive),
//     domContentLoadedEventStart: toOtelTime(navEntry.domContentLoadedEventStart),
//     domContentLoadedEventEnd: toOtelTime(navEntry.domContentLoadedEventEnd),
//     domComplete: toOtelTime(navEntry.domComplete),
//     loadEventStart: toOtelTime(navEntry.loadEventStart),
//     loadEventEnd: toOtelTime(navEntry.loadEventEnd),
//   };
//   console.log('Navigation timings (OpenTelemetry format):', timings);
// }

// const resources = performance.getEntriesByType('resource');

// // Resource timings in OpenTelemetry format
// resources.forEach((resource) => {
//   const timings = {
//     name: resource.name,
//     fetchStart: toOtelTime(resource.fetchStart),
//     domainLookupStart: toOtelTime(resource.domainLookupStart),
//     domainLookupEnd: toOtelTime(resource.domainLookupEnd),
//     connectStart: toOtelTime(resource.connectStart),
//     connectEnd: toOtelTime(resource.connectEnd),
//     requestStart: toOtelTime(resource.requestStart),
//     responseStart: toOtelTime(resource.responseStart),
//     responseEnd: toOtelTime(resource.responseEnd),
//   };
//   console.log('Resource timings (OpenTelemetry format):', timings);
// });

// // const paintEntries = performance.getEntriesByType('paint');
// // paintEntries.forEach((entry) => {
// //   console.log('Paint timing:', entry.name, entry.startTime);
// // });

// // const markEntries = performance.getEntriesByType('mark');
// // markEntries.forEach((entry) => {
// //   console.log('Mark:', entry.name, entry.startTime);
// // });

// // const measureEntries = performance.getEntriesByType('measure');
// // measureEntries.forEach((entry) => {
// //   console.log('Measure:', entry.name, entry.startTime, entry.duration);
// // });
