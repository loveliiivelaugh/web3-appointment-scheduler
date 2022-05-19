// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Calend3 {
  uint rate;
  address payable public owner;

  struct Appointment {
    string title; // title of the meeting
    address attendee; // person you are meeting with
    uint startTime; // start time of meeting
    uint endTime; //end time of meeting
    uint amountPaid; // amount paid for that meeting
  }

  Appointment[] appointments;

  // constructor only runs once whenever smart contract is deployed.
  constructor() {
    owner = payable(msg.sender);
  }

  function getRate() public returns (uint) {
    return rate;
  }

  function setRate(uint _rate) public {
    require(msg.sender == owner, "Only the owner can set the rate.");
    rate = _rate;
  }

  function getAppointments() public view returns (Appointment[] memory) {
    return appointments;
  }

  function createAppointment(string memory title, uint startTime, uint endTime) public payable {
    Appointment memory appointment;
    appointment.title = title;
    appointment.startTime = startTime;
    appointment.endTime = endTime;
    appointment.amountPaid = ((endTime - startTime) / 60) * rate;
    appointment.attendee = msg.sender; // address of person calling contract

    require(msg.value >= appointment.amountPaid, "We require more ether");

    (bool success,) = owner.call{value: msg.value}(""); // send ETH to the owner
    require(success, "Failed to send Ether");

    appointments.push(appointment);
  }
}