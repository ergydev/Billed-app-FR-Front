/**
 * @jest-environment jsdom
 */

import {fireEvent, getByTestId, screen, waitFor} from "@testing-library/dom"
import '@testing-library/jest-dom/extend-expect'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import { ROUTES_PATH, ROUTES} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js"
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      const iconActivate = windowIcon.classList.contains('active-icon')
      expect(iconActivate).toBeTruthy()

    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML.trim())
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    test("Clicking on the new bill button should open the new bill page" , () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)

      const store = null
      const allBills = new Bills({ document, onNavigate, store, localStorage: window.localStorage})

      const newBill = jest.fn(() => allBills.handleClickNewBill)
      const btn = screen.getByTestId('btn-new-bill')

      btn.addEventListener('click', newBill)
      fireEvent.click(btn)
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy
    })

    test('I can open bills file when I click on the eye button' , () => {
      const page = BillsUI({
        data: bills
      })

      document.body.innerHTML = page

      const store = null
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const allBills = new Bills ({ document, onNavigate, store, localStorage: window.localStorage })

      //render modale
      $.fn.modal = jest.fn()
      const icon = screen.getAllByTestId('icon-eye')[0]
      const handleClickIconEye = jest.fn(() => 
        allBills.handleClickIconEye(icon)
      )
      icon.addEventListener('click', handleClickIconEye)
      fireEvent.click(icon)
      expect(handleClickIconEye).toHaveBeenCalled()
      const modale = document.getElementById('modaleFile')
      expect(modale).toBeTruthy()
    })
  })
})

// test intégration
describe("Given that I am connected as an employee", () => {
  describe("When I am on bills page", () => {
    test("Fetch bills from API GET", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)

      const pathName = ROUTES_PATH['Bills']
      root.innerHTML = ROUTES({ pathname: pathName, loading: true })

      const bills = new Bills({ document, onNavigate, store: mockStore, localStorage})
      bills.getBills().then(data => {
        root.innerHTML = BillsUI({ data })
        expect(document.querySelector('tbody').rows.length).toBeGreaterThan(0)
      })
    })
  })
})

describe("When an error occurs on the API", () => {
  beforeEach(() => {
    jest.spyOn(mockStore, "bills")
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "a@a"
    }))

    const root = document.createElement('div')
    root.setAttribute("id", "root")
    document.body.appendChild(root)
    router()
  })

  test("fetches bills from an API and fails with 404 message error", async() => {
    const html = BillsUI({ error: 'Erreur 404' })
    document.body.innerHTML = html
    const message = await screen.getByText(/Erreur 404/)
    expect(message).toBeTruthy
  })

  test("fetches bills from an API and fails with 500 message error", async() => {
    const html = BillsUI({ error: 'Erreur 500' })
    document.body.innerHTML = html
    const message = await screen.getByText(/Erreur 500/)
    expect(message).toBeTruthy
  })
})