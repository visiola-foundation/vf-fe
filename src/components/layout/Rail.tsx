import { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { pagesForRole, type Role } from '../../lib/access';

/** Session-driven menu: only the signed-in role's pages are rendered. */
export function Rail({ role }: { role: Role }) {
  const items = pagesForRole(role);

  let lastGroup = '';

  return (
    <nav aria-label="Primary" className="sticky top-16 h-[calc(100vh-64px)] w-[230px] flex-none overflow-y-auto bg-ink px-3 pb-10 pt-[18px] text-white max-[820px]:static max-[820px]:flex max-[820px]:h-auto max-[820px]:w-full max-[820px]:gap-1.5 max-[820px]:overflow-x-auto max-[820px]:whitespace-nowrap max-[820px]:px-2.5 max-[820px]:py-2.5">
      {items.map((p) => {
        const showGroup = p.group !== lastGroup;
        lastGroup = p.group;
        return (
          <Fragment key={p.id}>
            {showGroup ? (
              <div className="px-2.5 pb-1.5 pt-3.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#7E8480] max-[820px]:hidden">
                {p.group}
              </div>
            ) : null}
            <NavLink
              to={`/${p.id}`}
              className={({ isActive }) =>
                `flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-[9px] text-left text-[14px] max-[820px]:w-auto max-[820px]:px-[13px] max-[820px]:py-2 max-[820px]:text-[13px] ${
                  isActive
                    ? 'bg-white font-[650] text-ink'
                    : 'text-[#C9CEC8] hover:bg-[#242122] hover:text-white'
                }`
              }
            >
              <span>{p.label}</span>
            </NavLink>
          </Fragment>
        );
      })}
    </nav>
  );
}
