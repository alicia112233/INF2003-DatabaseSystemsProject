import Link from "next/link";
import {
  CardContent,
  Typography,
  Grid,
  Rating,
  Tooltip,
  Fab,
  Avatar
} from "@mui/material";

import { Stack } from "@mui/system";
import { IconBasket } from "@tabler/icons-react";
import BlankCard from "@/app/(DashboardLayout)/components/shared/BlankCard";

const ecoCard = [
  {
    title: "A Plague Tale: Requiem",
    subheader: "September 14, 2023",
    photo: '/images/products/PR.jpg',
    salesPrice: 40,
    price: 100,
    rating: 4,
  },
  {
    title: "Super Meat Boy",
    subheader: "September 14, 2023",
    photo: '/images/products/SMB.jpg',
    salesPrice: 20,
    price: 30,
    rating: 5,
  },
  {
    title: "Chivalry 2",
    subheader: "September 14, 2023",
    photo: '/images/products/CHI.jpg',
    salesPrice: 12.50,
    price: 20,
    rating: 3,
  },
  {
    title: "Forza Horizon 5",
    subheader: "September 14, 2023",
    photo: '/images/products/FH.jpg',
    salesPrice: 285,
    price: 345,
    rating: 2,
  },
];

const Blog = () => {
  return (
    <Grid container spacing={3}>
      {ecoCard.map((product, index) => (
        <Grid
          key={index}
          size={{
            xs: 12,
            md: 4,
            lg: 3
          }}>
          <BlankCard>
            <Typography component={Link} href="/">
              <Avatar
                src={product.photo} variant="square"
                sx={{
                  height: 250,
                  width: '100%',
                }}
                
              />
            </Typography>
            <Tooltip title="Add To Cart">
              <Fab
                size="small"
                color="primary"
                sx={{ bottom: "75px", right: "15px", position: "absolute" }}
              >
                <IconBasket size="16" />
              </Fab>
            </Tooltip>
            <CardContent
              sx={{
                p: 3,
                pt: 2,
                height: 140,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {product.title}
              </Typography>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                mt={1}
              >
                <Stack direction="row" alignItems="center">
                  <Typography variant="h6">${product.salesPrice}</Typography>
                  <Typography
                    color="textSecondary"
                    ml={1}
                    sx={{ textDecoration: "line-through" }}
                  >
                    ${product.price}
                  </Typography>
                </Stack>
                <Rating
                  name="read-only"
                  size="small"
                  value={product.rating}
                  readOnly
                />
              </Stack>
            </CardContent>
          </BlankCard>
        </Grid>
      ))}
    </Grid>
  );
};

export default Blog;
