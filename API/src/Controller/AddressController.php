<?php

namespace App\Controller;

use App\Repository\AddressRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class AddressController extends AbstractController
{
    private $addressRepository;

    public function __construct(AddressRepository $addressRepository)
    {
        $this->addressRepository = $addressRepository;
    }

    /**
     * @Route("/suggestAddress/{address}", name="suggestAddress", methods={"GET"})
     */
    public function suggestAddress($address): JsonResponse
    {
        $data = $this->addressRepository->suggestAddress($address);

        return new JsonResponse($data, Response::HTTP_OK);
    }

    /**
     * @Route("/findProducts/{typeRoad}/{street}/{township}/{province}/{number}", name="findProducts", methods={"GET"})
     */
    public function findProducts($typeRoad, $street, $township, $province, $number): JsonResponse
    {
        $data = [];
        $products = $this->addressRepository->findOneBy(['tipovia' => $typeRoad, 'calle' => $street, 'municipio' => $township, 'provincia' => $province, 'numero' => $number]);
        if (!empty($products)) {
            $data[] = $products->getProducto();
        }

        return new JsonResponse($data, Response::HTTP_OK);
    }
}
