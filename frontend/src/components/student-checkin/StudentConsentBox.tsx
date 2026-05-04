type Props = {
  hasConsent: boolean
  checked: boolean
  onCheckedChange: (value: boolean) => void
}

export function StudentConsentBox({
  hasConsent,
  checked,
  onCheckedChange,
}: Props) {
  if (hasConsent) {
    return (
      <div className="consent-box consent-box-accepted">
        Согласие на сбор и обработку геоданных получено.
      </div>
    )
  }

  return (
    <label className="consent-box">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
      />
      <span>
        Я даю согласие на сбор и обработку моих геоданных для подтверждения
        нахождения на месте прохождения практики. Геоданные используются только
        в целях контроля прохождения практики.
      </span>
    </label>
  )
}