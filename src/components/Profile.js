import React, { Component } from 'react';
import styled, { keyframes } from 'styled-components';
import Avatar from './Avatar';
import { ExternalLink } from '../common';
import { generateAvatar } from '../helpers/avatar';

const ProfileContainer = styled.div `
  flex : 1;
  padding-top: 10vh;
  background-color: #F6F6F6;
  text-align: center;
  color: #414141;
  font-size: 0.8rem;
  height: 100vh;
`;

const blink = keyframes`
  from, to {
    color: transparent;
  }

  50% {
    color: #808080;
  }
`;

const BlinkingSpan = styled.span `
  font-size: 24px;
  color: #808080;
  position: relative;
  right: 36px;
  -webkit-animation: 1s ${blink} step-end infinite;
  -moz-animation: 1s ${blink} step-end infinite;
  -ms-animation: 1s ${blink} step-end infinite;
  -o-animation: 1s ${blink} step-end infinite;
  animation: 1s ${blink} step-end infinite;
`;

const NicknameInput = styled.input`
  border: none;
  background-color: #f6f6f6;
  font-size: 19px;
  text-align: center;
  caret-color: #808080;
`;

const AddText = styled.p`
  font-size: 1.5em;
`;

const SaveButton = styled.button`
  background: none;
  padding: 10px;
  font-size: 18px;
  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  };
`;

const Space = ({size}) => <div style={{marginTop: size}} />

class Profile extends Component {
  render() {
    let { address, nickname, image, onNicknameChange, onDrop } = this.props;
    if (!image) image = generateAvatar(address);
    return  <ProfileContainer>
        <AddText>Set your Avatar</AddText>
        <p>Drag and Drop your Image.</p>
        <img src={image} />
        <Space size={'5em'} />
        <AddText>Set your Nickname</AddText>
        <p>
          <NicknameInput onChange={onNicknameChange}
            type="text"
            placeholder="Purple Elephant"
            onfocus="this.placeholder = ''"
            onblur="this.placeholder = 'enter your text'"
            value={nickname} />

          <BlinkingSpan > | </BlinkingSpan>
        </p>
        <Space size={'5em'} />
        <SaveButton>
          Update Sybil
        </SaveButton>
      </ProfileContainer>;
  }
}

export default Profile;
