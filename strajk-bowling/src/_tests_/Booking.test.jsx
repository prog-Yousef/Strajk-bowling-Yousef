import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Booking from '../views/Booking';
import React from "react";
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Booking", () => {
  let timeInput, bookingButton, lanesInput, peopleInput, ShoeButton, dateInput;

  beforeEach(() => {
    render(<MemoryRouter><Booking /></MemoryRouter>);

    // Set up the inputs and buttons here so they are accessible in all tests
    timeInput = screen.getByPlaceholderText("Time");
    bookingButton = screen.getByText("strIIIIIike!"); // Replace with correct button text
    lanesInput = screen.getByLabelText("Number of lanes");
    peopleInput = screen.getByPlaceholderText("Number of awesome bowlers");
    ShoeButton = screen.getByRole("button", { name: "+" }); // Corrected role selection
    dateInput = screen.getByPlaceholderText("Date");
  });

  it("should render the Booking form", () => {
    fireEvent.change(timeInput, { target: { value: "11:00" } });
    fireEvent.change(dateInput, { target: { value: "2023-01-01" } });
    expect(timeInput.value).toBe("11:00");
    expect(dateInput.value).toBe("2023-01-01");
  });

  it("should show error when fields are missing", async () => {
    fireEvent.change(dateInput, { target: { value: "2023-01-01" } });
    fireEvent.change(timeInput, { target: { value: "11:00" } });

    // Missing the number of players
    fireEvent.change(lanesInput, { target: { value: "1" } });
    fireEvent.click(bookingButton);
    expect(screen.getByText("Alla fälten måste vara ifyllda")).toBeInTheDocument();

    // Now fill in the players but leave out lanes
    fireEvent.change(peopleInput, { target: { value: "2" } });
    fireEvent.click(bookingButton);
    expect(screen.getByText("Alla fälten måste vara ifyllda")).toBeInTheDocument();

    // Fill in everything but leave out shoe size
    fireEvent.change(lanesInput, { target: { value: "1" } });
    fireEvent.click(ShoeButton);
    fireEvent.click(bookingButton);
    expect(screen.getByText("Alla skor måste vara ifyllda")).toBeInTheDocument();
  });

  it("should enable selection of the number of players and lanes", () => {
    fireEvent.change(peopleInput, { target: { value: "2" } });
    fireEvent.change(lanesInput, { target: { value: "1" } });

    expect(peopleInput.value).toBe("2");
    expect(lanesInput.value).toBe("1");
  });

  it("should complete booking and show confirmation page", async () => {
    fireEvent.change(dateInput, { target: { value: "2023-01-01" } });
    fireEvent.change(timeInput, { target: { value: "11:00" } });
    fireEvent.change(lanesInput, { target: { value: "1" } });
    fireEvent.change(peopleInput, { target: { value: "2" } });
    fireEvent.click(ShoeButton);
    fireEvent.click(ShoeButton);
  
    const shoeSizeInputs = screen.getAllByLabelText(/Shoe size \/ person/);
    for (let i = 0; i < shoeSizeInputs.length; i++) {
      fireEvent.change(shoeSizeInputs[i], { target: { value: i === 0 ? "42" : "41" } });
    }
  
    fireEvent.click(bookingButton);
  
    // Wait for the confirmation to be stored in sessionStorage with a timeout of 1000ms
    await waitFor(() => {
      const storedData = sessionStorage.getItem('confirmation');
      expect(storedData).toBeTruthy(); 
      const confirmation = JSON.parse(storedData);
      expect(confirmation).toBeDefined(); // Ensure the confirmation data is properly parsed
    }, { timeout: 1000 }); // Timeout after 1000ms
  });

  it("should show error when there are more players than available lanes", async () => {
    const players = 5;

    fireEvent.change(dateInput, { target: { value: "2024-01-01" } });
    fireEvent.change(timeInput, { target: { value: "11:00" } });
    fireEvent.change(peopleInput, { target: { value: String(players) } });
    fireEvent.change(lanesInput, { target: { value: "1" } });
    
    // Use Array.from and forEach
    Array.from({ length: players }).forEach(() => {
      fireEvent.click(ShoeButton);
    });
  
    const shoeInputs = screen.getAllByLabelText(/Shoe size \/ person/);
    shoeInputs.forEach((input) => {
      fireEvent.change(input, { target: { value: "42" } });
    });
  
    fireEvent.click(bookingButton);
  
    await waitFor(() => {
      expect(
        screen.queryByText("Det får max vara 4 spelare per bana")
      ).toBeInTheDocument();
    });
  });

  it("should allow removing and adding shoes", async () => {
    const players = 2;
  
    // Set the number of players
    fireEvent.change(peopleInput, { target: { value: String(players) } });
  
    // Add shoes for all players
    Array.from({ length: players }).forEach(() => {
      fireEvent.click(ShoeButton);
    });
  
    // Get the shoe inputs and check that there are 2 inputs
    let shoeInputs = screen.getAllByLabelText(/Shoe size \/ person/);
    expect(shoeInputs).toHaveLength(2);
  
    // Remove one shoe input (assuming "-" button exists)
    const removeButtons = screen.getAllByText("-");
    fireEvent.click(removeButtons[0]);
  
    // After removal, verify the number of shoe inputs is 1
    shoeInputs = screen.getAllByLabelText(/Shoe size \/ person/);
    expect(shoeInputs).toHaveLength(1);
  
    // Add shoe size inputs for the remaining players
    shoeInputs.forEach((input) => {
      fireEvent.change(input, { target: { value: "42" } });
    });
  
    // Check if the shoe inputs length is correct after actions
    const updatedShoeInputs = screen.getAllByLabelText(/Shoe size \/ person/);
    expect(updatedShoeInputs.length).toBe(players); // Expect 2 shoe inputs again
  });

  it("allows changing shoe sizes", () => {
    fireEvent.click(ShoeButton);
    const shoeInput = screen.getByLabelText(/Shoe size \/ person/);

    fireEvent.change(shoeInput, { target: { value: "42" } });
    expect(shoeInput.value).toBe("42");

    fireEvent.change(shoeInput, { target: { value: "41" } });
    expect(shoeInput.value).toBe("41");
  });

  it("should show error when the player shoes do not match the number of players", async () => {
    fireEvent.change(peopleInput, { target: { value: "2" } });
    fireEvent.change(lanesInput, { target: { value: "1" } });
    fireEvent.change(dateInput, { target: { value: "2023-01-01" } });
    fireEvent.change(timeInput, { target: { value: "11:00" } });

    // Only add one shoe for two players
    fireEvent.click(ShoeButton);
    const shoeInput = screen.getByLabelText(/Shoe size \/ person/);
    fireEvent.change(shoeInput, { target: { value: "42" } });

    fireEvent.click(bookingButton);

    await waitFor(() => {
      expect(
        screen.queryByText("Antalet skor måste stämma överens med antalet spelare")
      ).toBeInTheDocument();
    });
  });

  it("should show error when not all shoes are filled", async () => {
    fireEvent.change(dateInput, { target: { value: "2023-01-01" } });
    fireEvent.change(timeInput, { target: { value: "11:00" } });
    fireEvent.change(peopleInput, { target: { value: "2" } });
    fireEvent.change(lanesInput, { target: { value: "1" } });

    // Add shoes but don't fill in sizes
    fireEvent.click(ShoeButton);
    fireEvent.click(ShoeButton);

    fireEvent.click(bookingButton);

    expect(
      screen.getByText("Alla skor måste vara ifyllda")
    ).toBeInTheDocument();
  });
});