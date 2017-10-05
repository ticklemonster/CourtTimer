import React from 'react';
import { Text } from 'native-base';

export default class TimeText extends React.Component {
  constructor() {
    super();

    this.lastDate = new Date();
    this.isRunning = false;
  }
  render() {
    let timestr = new Date(this.props.msecs).toISOString().substr(14,5);

    return (
      <Text>{ timestr }</Text>
    );
  }

}
