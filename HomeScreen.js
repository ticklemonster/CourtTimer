import React from 'react';
import { View } from 'react-native';
import { Container, Header, Left, Body, Right, Title, Content,
  Footer, FooterTab, Card, CardItem, Button, Icon, Text, H1,
  } from 'native-base';

export default class HomeScreen extends React.Component {

  constructor() {
    super();
    this.state = {

    };
  }

  renderTeamCard = (item) => {
    return (
      <CardItem style={{flex: 2}} button
          onPress={() => this.props.nav.game(item.key)}
          onLongPress={() => this.props.nav.edit(item.key)}
      >
        <Body style={{alignItems: 'center'}}>
          <Icon name='basketball' style={{fontSize: 90}}/>
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

          <Card style={{flex: 1}}>
            <CardItem button onPress={ this.props.nav.add }>
              <Body style={{alignItems: 'center'}}>
                <Icon name="add" style={{ fontSize: 90 }}/>
                <Text>Add a new team</Text>
              </Body>
            </CardItem>
          </Card>
        </Content>
        <Footer>
          <FooterTab>
          <Body>
            <Text>There are {this.props.teams.length || 0} teams</Text>
          </Body>
          <Right>
            <Button onPress={ this.props.nav.add }>
              <Icon name='add'/><Text>Add Team</Text>
            </Button>
          </Right>
          </FooterTab>
        </Footer>
      </Container>
    );
  }

}
