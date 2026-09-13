import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  modal: ReactNode;
};

export default function CteLayout({
  children,
  modal,
}: Props) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
