import React from 'react';
import { View } from 'react-native';
import { Container, Header, Body, Left, Right, Title, Content,
  Footer, FooterTab, Button, Icon, Form, Item, Input, Text,
  } from 'native-base';

export default class EditTeamScreen extends React.Component {

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
            <Title>Edit Team Details</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name='arrow-back' onPress={this.props.navHome} />
            </Button>
          </Right>
        </Header>
        <Content>
          <Form>
            <Item>
              <Input underline placeholder="Team name" />
            </Item>

            <Item>
              <Input placeholder='#' style={{flex: 1}}/>
              <Input placeholder='Player 1' style={{flex: 4}}/>
            </Item>
            <Item>
              <Input placeholder='#' style={{flex: 1}}/>
              <Input placeholder='Player 2' style={{flex: 4}}/>
            </Item>
            <Item>
              <Input placeholder='#' style={{flex: 1}}/>
              <Input placeholder='Player 3' style={{flex: 4}}/>
            </Item>
            <Item>
              <Input placeholder='#' style={{flex: 1}}/>
              <Input placeholder='Player 4' style={{flex: 4}}/>
            </Item>
            <Item>
              <Input placeholder='#' style={{flex: 1}}/>
              <Input placeholder='Player 5' style={{flex: 4}}/>
            </Item>
            <Item>
              <Input placeholder='#' style={{flex: 1}}/>
              <Input placeholder='Player 6' style={{flex: 4}}/>
            </Item>
            <Item>
              <Input placeholder='#' style={{flex: 1}}/>
              <Input placeholder='Player 7' style={{flex: 4}}/>
            </Item>
            <Item>
              <Input placeholder='#' style={{flex: 1}}/>
              <Input placeholder='Player 8' style={{flex: 4}}/>
            </Item>
            <Item>
              <Input placeholder='#' style={{flex: 1}}/>
              <Input placeholder='Player 9' style={{flex: 4}}/>
            </Item>
            <Item>
              <Input placeholder='#' style={{flex: 1}}/>
              <Input placeholder='Player 10' style={{flex: 4}}/>
            </Item>
          </Form>
          <View style={{marginTop: 20, padding: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Button primary><Icon name='checkmark' /><Text>Save</Text></Button>
            <Button light onPress={ this.props.navHome }><Icon name='close' /><Text>Cancel</Text></Button>
          </View>
        </Content>
      </Container>
    );
  }

}
