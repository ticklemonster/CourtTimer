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

  renderTeamCard = (item) => {
    return (
      <CardItem button onPress={() => this.props.navGame(item.name)}>
        <Body>
          <Icon name="basketball" style={{fontSize: 90}}/>
          <Text>{item.name}</Text>
        </Body>
      </CardItem>
    );

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
          <Card style={{flex: 0}}
            dataArray={ this.props.teams }
            renderRow={ this.renderTeamCard }>
          </Card>
          <Container>
            <Body>
              <Button onPress={ this.props.navAdd }>
                <Icon name="add" /><Text>Add a new team</Text>
              </Button>
            </Body>
          </Container>
        </Content>
        <Footer>
          <FooterTab>
          <Body>
            <Text>There are {this.props.teams.length || 0} teams</Text>
          </Body>
          </FooterTab>
        </Footer>
      </Container>
    );
  }

}
