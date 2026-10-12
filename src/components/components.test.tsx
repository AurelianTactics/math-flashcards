import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColumnEntry } from './ColumnEntry'
import { boxViews } from './boxes'
import { SessionView } from './SessionView'
import { StoreProvider } from '../hooks/useStore'
import { makeAddSubProblem } from '../generators/addSub'
import { createRng } from '../rng'
import { DEFAULT_SETTINGS, freshStore } from '../storage/schema'
import { STORAGE_KEY } from '../storage/storage'

describe('ColumnEntry', () => {
  it('highlights steps in order and reveals wrong digits', () => {
    const p = makeAddSubProblem(37, 25, '+', createRng(1), DEFAULT_SETTINGS)
    expect(p.layout).toBe('columns')
    const { rerender } = render(<ColumnEntry a={37} b={25} op="+" boxes={boxViews(p, 0, '', [], false)} />)
    expect(screen.getByLabelText('ones')).toHaveClass('box-active')
    expect(screen.getByLabelText('carry')).toHaveClass('box-pending')
    // ones done right, carry answered wrong (revealing)
    rerender(<ColumnEntry a={37} b={25} op="+" boxes={boxViews(p, 1, '0', [{ id: 'ones', tries: 1, firstTry: true }], true)} />)
    expect(screen.getByLabelText('ones')).toHaveClass('box-correct')
    expect(screen.getByLabelText('ones')).toHaveTextContent('2')
    expect(screen.getByLabelText('carry')).toHaveClass('box-wrong')
    expect(screen.getByLabelText('carry')).toHaveTextContent('1')
    expect(screen.getByLabelText('tens')).toHaveClass('box-pending')
  })
})

describe('SessionView', () => {
  beforeEach(() => localStorage.clear())

  it('logs one attempt per completed problem and shows a streak', async () => {
    const user = userEvent.setup()
    render(
      <StoreProvider initial={freshStore()}>
        <SessionView only="add" />
      </StoreProvider>,
    )
    // Tier 1 addition with no history is always a single-box problem: a + b = [ ]
    const problem = document.querySelector('.inline-problem')!
    const nums = [...problem.querySelectorAll(':scope > span')].map((s) => s.textContent?.trim())
    const answer = Number(nums[0]) + Number(nums[2])
    await user.keyboard(String(answer))
    await user.keyboard('{Enter}')
    expect(await screen.findByText('1 in a row')).toBeInTheDocument()
    await act(async () => {
      await new Promise((r) => setTimeout(r, 400))
    })
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(saved.attempts).toHaveLength(1)
    expect(saved.attempts[0].correct).toBe(true)
    expect(saved.attempts[0].type).toBe('add')
  })

  it('shows the feedback panel after a wrong answer', async () => {
    const user = userEvent.setup()
    render(
      <StoreProvider initial={freshStore()}>
        <SessionView only="add" />
      </StoreProvider>,
    )
    await user.keyboard('0')
    await user.keyboard('{Enter}')
    expect(await screen.findByText('Next card (Enter)', {}, { timeout: 2000 })).toBeInTheDocument()
    expect(screen.getByText("Let's look at why.")).toBeInTheDocument()
  })
})
