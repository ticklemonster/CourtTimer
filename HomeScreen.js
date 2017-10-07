import React from 'react';
import { View } from 'react-native';
import { Container, Header, Left, Body, Right, Title, Content,
  Footer, FooterTab, Card, CardItem, Fab, Button, Icon, Text, H1,
  } from 'native-base';

export default class HomeScreen extends React.Component {

  constructor() {
    super();
    this.state = {

    };
  }

  render() {
    return (
      <Container>
        <Header>
          <Body>
            <Title>Court Timer</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name='more' />
            </Button>
          </Right>
        </Header>
        <Content>
          <Card style={{flex: 0}}>
            <CardItem button
                onPress={ () => this.props.navGame('Lakers B04')}>
              <Body>
                <Icon name="basketball" style={{fontSize: 90}}/>
                <Text>Lakers B04</Text>
              </Body>
            </CardItem>
          </Card>
          <Card style={{flex: 0}}>
            <CardItem>
              <Body>
                <Icon name="basketball" style={{fontSize: 90}}/>
                <Text>Team Name #2</Text>
              </Body>
            </CardItem>
          </Card>

          <Card>
            <CardItem>
              <Body>
                <Button onPress={ this.props.navAdd }>
                  <Icon name="add" /><Text>Add a new team</Text>
                </Button>
              </Body>
            </CardItem>
          </Card>

        </Content>
      </Container>
    );
  }

}
