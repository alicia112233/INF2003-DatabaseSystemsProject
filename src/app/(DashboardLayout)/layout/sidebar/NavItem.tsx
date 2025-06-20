import React from 'react';
import {
  ListItemIcon,
  ListItem,
  List,
  styled,
  ListItemText,
  useTheme,
  ListItemButton,
  Box,
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItemProps {
  item: {
    id?: string;
    title?: string;
    icon?: React.ElementType | null;
    href?: string;
    content?: React.ReactNode;
    [key: string]: any;
  };
}

const NavItem = ({ item }: NavItemProps) => {
  const theme = useTheme();
  const pathname = usePathname();
  const isActive = pathname === item.href;

  const ListItemStyled = styled(ListItem)(() => ({
    padding: 0,
    marginBottom: theme.spacing(1),
  }));

  const ListItemButtonStyled = styled(ListItemButton)(({ theme }) => ({
    whiteSpace: 'nowrap',
    borderRadius: '8px',
    backgroundColor: isActive ? theme.palette.primary.main : 'transparent',
    color: isActive ? theme.palette.primary.contrastText : theme.palette.text.primary,
    '&:hover': {
      backgroundColor: isActive
        ? theme.palette.primary.main
        : theme.palette.action.hover,
    },
  }));

  const ListItemIconStyled = styled(ListItemIcon)(({ theme }) => ({
    minWidth: '36px',
    color: isActive ? theme.palette.primary.contrastText : theme.palette.text.primary,
  }));

  const ListItemTextStyled = styled(ListItemText)(() => ({
    margin: 0,
  }));

  const Icon = item.icon;

  // 👇 Handle custom JSX content (e.g., Upgrade box)
  if (item.content) {
    return <Box my={2}>{item.content}</Box>;
  }

  return (
    <List disablePadding key={item.id}>
      <ListItemStyled>
        <Link href={item.href || '#'} style={{ textDecoration: 'none', width: '100%' }}>
          <ListItemButtonStyled>
            {Icon && (
              <ListItemIconStyled>
                <Icon stroke={1.5} size="20px" />
              </ListItemIconStyled>
            )}
            <ListItemTextStyled primary={item.title} />
          </ListItemButtonStyled>
        </Link>
      </ListItemStyled>
    </List>
  );
};

export default NavItem;