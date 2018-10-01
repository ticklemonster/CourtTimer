import React from 'react';
import { Text } from 'react-native';

export default class TimeText extends React.PureComponent {
  render() {
    let timestr = new Date(this.props.msecs).toISOString().substr(14,5);

    return (
      <Text>{ timestr }</Text>
    );
  }
}
