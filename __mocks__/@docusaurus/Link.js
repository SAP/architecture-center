const React = require('react');
// Simple mock for @docusaurus/Link: renders an <a> element
module.exports = function MockLink({ children, to, href, className }) {
    return React.createElement('a', { href: to || href, className }, children);
};
