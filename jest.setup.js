import 'react-app-polyfill/stable';
import '@testing-library/jest-dom/extend-expect';
import { mockMatchMedia } from './src/testUtils';

mockMatchMedia();

// Mock Math.random te prevent snapshots being updated each test
global.Math.random = () => 0.123456789;
