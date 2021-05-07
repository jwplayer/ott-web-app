import 'react-app-polyfill/stable';
import '@testing-library/jest-dom/extend-expect';
import { mockMatchMedia } from './src/testUtils';

mockMatchMedia();
