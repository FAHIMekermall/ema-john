import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import useProducts from "../../hooks/useProducts"
import { addToDb, getStoredCart } from "../../utilities/fakedb"
import Cart from "../Cart/Cart"
import Product from "../Product/Product"
import "./Shop.css"

const Shop = () => {
	const [products, setProducts] = useState([])
	const [cart, setCart] = useState([])
	const [page, setPage] = useState(0)
	// const [totalProduct, setTotalProduct] = useState(0)
	const [productCount, setProductCount] = useState(15)
	const [currentPage, setCurrentPage] = useState(0)
	useEffect(() => {
		fetch("http://localhost:4000/productCount")
			.then((res) => res.json())
			.then((data) => setPage(Math.ceil(data.count / productCount)))
	}, [])
	useEffect(() => {
		fetch(
			`http://localhost:4000/products?page=${currentPage}&productCount=${productCount}`
		)
			.then((res) => res.json())
			.then((data) => setProducts(data))
	}, [currentPage, productCount])

	useEffect(() => {
		const storedCart = getStoredCart()
		const savedCart = []
		for (const id in storedCart) {
			const addedProduct = products.find((product) => product._id === id)
			if (addedProduct) {
				const quantity = storedCart[id]
				addedProduct.quantity = quantity
				savedCart.push(addedProduct)
			}
		}
		setCart(savedCart)
	}, [products])

	const handleAddToCart = (selectedProduct) => {
		console.log(selectedProduct)
		let newCart = []
		const exists = cart.find(
			(product) => product._id === selectedProduct._id
		)
		if (!exists) {
			selectedProduct.quantity = 1
			newCart = [...cart, selectedProduct]
		} else {
			const rest = cart.filter(
				(product) => product._id !== selectedProduct._id
			)
			exists.quantity = exists.quantity + 1
			newCart = [...rest, exists]
		}

		setCart(newCart)
		addToDb(selectedProduct._id)
	}

	return (
		<div className="shop-container">
			<div>
				<div className="products-container">
					{products.map((product) => (
						<Product
							key={product._id}
							product={product}
							handleAddToCart={handleAddToCart}
						></Product>
					))}
				</div>
				<div className="pageButtonContainer">
					<button
						className="pageButton"
						onClick={() => {
							if (currentPage !== 0) {
								setCurrentPage(currentPage - 1)
							}
						}}
					>
						|---
					</button>
					{[...Array(page).keys()].map((num) => (
						<button
							onClick={() => setCurrentPage(num)}
							className={`pageButton ${
								num === currentPage
									? "activePage"
									: "unactivePage"
							}`}
						>
							{num}
						</button>
					))}
					<button
						className="pageButton"
						onClick={() => {
							if (currentPage < page - 1)
								setCurrentPage(currentPage + 1)
						}}
					>
						{" "}
						---|
					</button>

					<select onChange={(e) => setProductCount(e.target.value)} name="" id="pageProductSelect">
						<option value="5">5</option>
						<option value="10">10</option>
						<option selected value="15">
							15
						</option>
						<option value="20">20</option>
						<option value="25">25</option>
					</select>
				</div>
			</div>
			<div className="cart-container">
				<Cart cart={cart}>
					<Link to="/orders">
						<button>Review Order </button>
					</Link>
				</Cart>
			</div>
		</div>
	)
}

export default Shop
