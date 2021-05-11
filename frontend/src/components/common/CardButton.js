import styled from "styled-components";
import {grey400} from "material-ui/styles/colors";

export const CardButton = styled.a`
  border: 1px solid #B0B9BE;
  border-radius: 6px;
  padding: 10px 20px;
  background-color: ${({disabled}) => disabled ? grey400 : '#FFFFFF'};
  color: '#8091A5 !important',
  font-weight: bold;
  font-size: 16px;
  font-family: "Montserrat";
  text-decoration: none;
  &:hover {
    text-decoration: none;
    color: '#8091A5 !important'
  }
`;
