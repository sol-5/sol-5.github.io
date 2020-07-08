const App = {
  RootElement: '#root',
  Event: (eventName, payload={}) => {
    const event = new CustomEvent(eventName, payload);
    document.querySelector(App.RootElement).dispatchEvent(event);
  }
};

export default App;